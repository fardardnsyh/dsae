'use client';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Inbox } from 'lucide-react';
import { uploadToS3 } from '../lib/db/s3';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ file_key, file_name }: { file_key: string, file_name: string }) => {
      const response = await axios.post('/api/create-chat', { file_key, file_name });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
     },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }

      const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');

      if (!isPDF) {
        const isWordDocument = file.name.endsWith('.doc') || file.name.endsWith('.docx');
        if (isWordDocument) {
          toast.error("Please upload a PDF file to start chatting.");
        } else {
          toast.error("Invalid file type. Please upload a PDF.");
        }
        return;
      }


      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong.");
          return;
        }
        mutate(data, {
          onSuccess: ({chat_id}) => {
            toast.success("Chat created!");
            // router.push(`/chat/${chat_id}`);
            router.push(`/chat/${chat_id}`);
            console.log(data);
          },
          onError: (err) => {
            toast.error("Error creating chat.");
            console.log(err);
          },
        });
      } catch (error) {
        console.error('Error during file upload:', error);
        toast.error("Error uploading file.");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className: 'border-dashed border-2 rounded-xl cursor-pointer bg-grey-50 py-8 flex justify-center items-center flex-col h-48',
        })}
      >
        <input {...getInputProps()} />
        {(uploading || isPending) ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-400">Processing Your upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="text-sm text-slate-400">Drop PDF here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
