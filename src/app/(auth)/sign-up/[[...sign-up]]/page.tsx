'use client';

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden">

      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)
          `,
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />
      

      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      />
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"
        style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
      />
      <div 
        className="absolute -bottom-8 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"
        style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
      />
      

      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      <div className="relative z-10">
        <SignUp 
          appearance={{
            elements: {
              footer: "hidden",
            },
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
