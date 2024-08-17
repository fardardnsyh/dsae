import { auth } from '@clerk/nextjs/server';
import { Button } from "../components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react";
import FileUpload from '../components/FileUpload';
import SubscriptionButton from '@/components/SubscriptionButton';
import { checkSubscription } from "@/lib/subscription";
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq } from "drizzle-orm";
import './page.css';
import Header from '../components/Header';
import Head from 'next/head';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";



export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();

  let firstChat = null;
  if (userId) {
    const chatResults = await db.select().from(chats).where(eq(chats.userId, userId));
    firstChat = chatResults[0] || null;
  }

  return (
    <>
    <Head>
      <title>Your Page Title</title>
      <meta name="description" content="Your page description" />
      <script defer data-domain="chatbotpdf.com" src="https://plausible.io/js/script.js"></script>
    </Head>
    <div className="relative w-screen min-h-screen bg-gradient-to-r from-purple-900 via-blue-900 to-teal-900 overflow-hidden z-0">
      <Header/>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-30 z-0"></div>

      {/* Background Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Existing Bubbles */}
          <div className="absolute w-24 h-24 bg-purple-600 rounded-full opacity-40 animate-bubble1"></div>
          <div className="absolute w-32 h-32 bg-blue-600 rounded-full opacity-40 animate-bubble2"></div>
          <div className="absolute w-16 h-16 bg-teal-600 rounded-full opacity-40 animate-bubble3"></div>
          <div className="absolute w-20 h-20 bg-indigo-600 rounded-full opacity-40 animate-bubble4"></div>
          <div className="absolute w-28 h-28 bg-purple-600 rounded-full opacity-40 animate-bubble5"></div>
          <div className="absolute w-36 h-36 bg-blue-600 rounded-full opacity-40 animate-bubble6"></div>
          <div className="absolute w-18 h-18 bg-teal-600 rounded-full opacity-40 animate-bubble7"></div>
          <div className="absolute w-22 h-22 bg-indigo-600 rounded-full opacity-40 animate-bubble8"></div>
          <div className="absolute w-26 h-26 bg-purple-600 rounded-full opacity-40 animate-bubble9"></div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mb-2 text-5xl font-semibold text-white">Start chatting with AI about your PDF content</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2 mb-2">
            {isAuth && firstChat && 
              <Link href={`/chat/${firstChat.id}`}>
                <Button>Go to Chats</Button>
              </Link>
            }
            <div className="ml-3">
            {isAuth && (
              <div className="ml-3">
                <SubscriptionButton isPro={isPro} />
              </div>
            )}

            </div>
          </div>

          <p className="mt-2 mb-2 text-lg text-slate-300">
            100% Free. Get instant answers, summaries, and insights powered by AI.
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Login to get Started!
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
    <Analytics />
    <SpeedInsights />
    </>
  );
}
