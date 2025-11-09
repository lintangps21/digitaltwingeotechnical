"use client";

import { CheckCircle } from "lucide-react";

export function About() {
  const features = [
    "State-of-the-art digital twin technology",
    "Expert geotechnical engineering team",
    "Real-time data processing and analysis",
    "Scalable solutions for projects of all sizes",
    "24/7 monitoring and support",
    "Industry-leading accuracy and reliability",
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl text-[var(--dtg-teal)] mb-6">About Digital Twin Geotechnical</h2>
            <p className="mb-6">
              Digital Twin Geotechnical is a 100% Australian owned mining services company providing real-time
              remote mine monitoring and related services for global mining cleints from our Geotechnical
              Monitoring Centre based in Yogyakarta, Indonesia.
            </p>
            <p className=" mb-8">
              At Digital Twin Geotechnical, our mission is to provide innovative geotechnical solutions by
              partnering with our clients to discover new, innovative, disruptive mine monitoring technology.
              We aim to enhance safety and efficiency in the mining industry through our comprehensive
              real-time remote monitoring services.
            </p>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--dtg-teal)] mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-teal-500/80 to-transparent border border-teal-800 p-8">
              <div className="h-full flex flex-col justify-center gap-8">
                <div className="border-l-4 border-[var(--dtg-teal)] pl-6">
                  <div className="text-2xl text-[var(--dtg-teal)] mb-2">Innovation</div>
                  <p >
                    Pushing the boundaries of what's possible in geotechnical engineering
                  </p>
                </div>
                <div className="border-l-4 border-[var(--dtg-teal)] pl-6">
                  <div className="text-2xl text-[var(--dtg-teal)] mb-2">Precision</div>
                  <p >
                    Delivering accurate, reliable data for critical decision-making
                  </p>
                </div>
                <div className="border-l-4 border-[var(--dtg-teal)] pl-6">
                  <div className="text-2xl text-[var(--dtg-teal)] mb-2">Partnership</div>
                  <p >
                    Working closely with clients to achieve project success
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}