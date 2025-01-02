"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MusicIcon, SyncIcon, DevicesIcon } from "@/components/icons";

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-white to-pink-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    优雅的哔哩哔哩
                  </span>
                  <br />
                  音乐播放器
                </h1>
                <p className="mt-6 text-xl text-gray-600">
                  让你以全新的方式聆听B站音乐
                </p>
                <div className="mt-10 flex gap-4">
                  <Link
                    href="/download"
                    className="px-8 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all hover:shadow-lg"
                  >
                    立即下载
                  </Link>
                  <Link
                    href="/docs"
                    className="px-8 py-3 bg-white text-pink-500 border-2 border-pink-500 rounded-full hover:bg-pink-50 transition-all"
                  >
                    了解更多
                  </Link>
                </div>
              </motion.div>
            </div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/screenshot.png"
                  alt="BiliMusic Screenshot"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold">主要特性</h2>
            <p className="mt-4 text-xl text-gray-600">精心打造的功能，带来极致体验</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mb-6 text-pink-500 bg-pink-50 p-3 rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    title: "优雅的界面",
    description: "精心设计的用户界面，让听音乐成为一种视觉享受",
    icon: <MusicIcon />
  },
  {
    title: "收藏夹同步", 
    description: "自动同步你的B站收藏夹，轻松管理你喜爱的音乐",
    icon: <SyncIcon />
  },
  {
    title: "跨平台支持",
    description: "支持 Windows、macOS 等多个平台，随时随地听音乐",
    icon: <DevicesIcon />
  }
];
