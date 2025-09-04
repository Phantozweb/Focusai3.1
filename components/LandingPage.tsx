
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, BookUser, BrainCircuit, ListChecks, WandSparkles, Star, LayoutTemplate, FileText, CheckCircle, Save, MessageSquare, Pencil, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import FreeTrialModal from './FreeTrialModal';

const showcaseFeatures = [
  {
    id: 'assistant',
    icon: WandSparkles,
    title: 'AI Assistant',
    description: 'Get instant, detailed answers to complex optometry questions.',
  },
  {
    id: 'canvas',
    icon: LayoutTemplate,
    title: 'AI Canvas',
    description: 'Generate comprehensive, editable study guides on any topic.',
  },
  {
    id: 'notes',
    icon: FileText,
    title: 'Study Notes',
    description: 'Create, organize, and search your own digital study library.',
  },
  {
    id: 'sessions',
    icon: BrainCircuit,
    title: 'Study Session',
    description: 'Learn step-by-step with AI-curated notes and integrated quizzes.',
  },
  {
    id: 'cases',
    icon: BookUser,
    title: 'Case Studies',
    description: 'Sharpen clinical decision-making with realistic patient scenarios.',
  },
  {
    id: 'quizzes',
    icon: ListChecks,
    title: 'Customisable Quizzes',
    description: 'Generate tailored quizzes with various question types and difficulties.',
  },
  {
    id: 'flow',
    icon: Zap,
    title: 'Flow',
    description: 'Flow through bite-sized study facts and quizzes in a reel-like format.',
  },
];

const useCases = [
  {
    icon: WandSparkles,
    title: "Clarify Doubts in Seconds",
    description: "Stuck on a complex concept during a lecture? Use the AI Assistant to get a simple, clear explanation instantly.",
  },
  {
    icon: LayoutTemplate,
    title: "Generate Structured Study Guides",
    description: "Turn a dense topic like 'Ocular Blood Supply' into a well-structured study guide, complete with headings, summaries, and tables, using AI Canvas.",
  },
  {
    icon: ListChecks,
    title: "Create Pre-Exam Mock Tests",
    description: "Feed your notes on 'Glaucoma Pharmacology' into the Custom Quiz generator to create a targeted test before your exam.",
  },
  {
    icon: BookUser,
    title: "Practice Clinical Scenarios",
    description: "Run through Case Studies on conditions you haven't seen in clinics yet, like 'Acanthamoeba Keratitis'.",
  },
  {
    icon: BrainCircuit,
    title: "Master Difficult Topics",
    description: "Feeling overwhelmed by 'Binocular Vision'? Let a Study Session break it down into manageable, interactive lessons.",
  },
  {
    icon: FileText,
    title: "Build Your Digital Brain",
    description: "Save insights from the AI, case studies, and your own notes into one searchable Study Notes library for quick revision.",
  },
  {
    icon: Save,
    title: "Summarize Research Papers",
    description: "Paste text from a lengthy research article into the AI Assistant and ask for a summary of its key findings and clinical relevance.",
  },
  {
    icon: MessageSquare,
    title: "Interrogate a Case File",
    description: "After reviewing a case, use the integrated chat to ask specific questions like 'What was the patient's exact visual acuity?'",
  },
  {
    icon: Pencil,
    title: "Refine and Elaborate Your Notes",
    description: "Use the AI Edit tools within the chat or Canvas to take your brief notes and elaborate on them with clinical examples.",
  },
  {
    icon: CheckCircle,
    title: "Verify Your Knowledge",
    description: "Before an exam, ask the AI Assistant to quiz you on key facts about a topic to quickly check your recall and understanding.",
  },
];


const testimonials = [
  {
    quote: "Focus AI's case studies are incredibly realistic. They've been a huge help in preparing for my clinical postings at Sankara Nethralaya. My confidence has skyrocketed.",
    name: "Priya Sharma",
    title: "OD Candidate, Elite School of Optometry, Chennai",
  },
  {
    quote: "The ability to generate a custom quiz on a specific topic in seconds is a game-changer for my exam prep. It's the best study tool I've used, hands down.",
    name: "Rohan Mehta",
    title: "Optometry Student, AIIMS Delhi",
  },
  {
    quote: "I used to struggle with Binocular Vision, but the Study Sessions broke it down perfectly. I finally feel like I understand the concepts, not just memorize them.",
    name: "Anjali Rao",
    title: "Third Year Student, LVPEI, Hyderabad",
  },
];

const pricingFeatures = [
    'Unlimited AI Assistant Queries',
    'Unlimited AI Canvas Generation',
    'Full Access to All Study Tools',
    'Save & Organize Unlimited Notes',
    'Interactive Cases & Quizzes',
    'Priority Access to New Features',
];

const MotionHeader = motion.header as React.ElementType;
const MotionSection = motion.section as React.ElementType;
const MotionH1 = motion.h1 as React.ElementType;
const MotionP = motion.p as React.ElementType;
const MotionDiv = motion.div as React.ElementType;

const LandingPage: React.FC<{ onLoginSuccess: (user: any) => void, onSubscribe: () => void, onOpenTrialModal: () => void }> = ({ onLoginSuccess, onSubscribe, onOpenTrialModal }) => {
  const [featureIndex, setFeatureIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleNext = () => {
    setFeatureIndex((prev) => (prev + 1) % showcaseFeatures.length);
  };

  const handlePrev = () => {
    setFeatureIndex((prev) => (prev - 1 + showcaseFeatures.length) % showcaseFeatures.length);
  };

  const startAutoCycle = () => {
    intervalRef.current = setInterval(handleNext, 4000);
  };

  useEffect(() => {
    startAutoCycle();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  const handleManualNavigation = (direction: 'prev' | 'next') => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (direction === 'next') handleNext();
    else handlePrev();
    startAutoCycle();
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <>
      <div className="bg-gray-900 text-white min-h-screen font-sans antialiased overflow-y-auto">
        {/* Background Grid */}
        <div className="absolute inset-0 z-0 bg-grid-gray-700/[0.1] [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]"></div>

        {/* Header */}
        <MotionHeader
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
            <span className="text-xl font-bold">Focus.AI</span>
          </div>
        </MotionHeader>

        <main className="relative z-10">
          {/* Hero Section */}
          <MotionSection
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center pt-20 pb-24 px-6"
          >
            <MotionH1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400"
            >
              Your AI Partner in Clinical Excellence
            </MotionH1>
            <MotionP
              variants={itemVariants}
              className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-400"
            >
              Go from question to mastery with a suite of AI-powered study tools built exclusively for optometry students.
            </MotionP>
            <MotionDiv variants={itemVariants} className="mt-10">
              <button
                onClick={onSubscribe}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-700 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/50"
              >
                <span className="relative z-10 flex items-center">
                  Get Full Access
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </MotionDiv>
          </MotionSection>

          {/* Features Carousel Section */}
          <section id="features-carousel" className="py-20 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">An All-In-One Study Toolkit</h2>
                <p className="mt-4 text-gray-400 max-w-xl mx-auto">Everything you need to succeed, from first year to board exams.</p>
              </div>
              <div className="relative h-64 flex items-center justify-center" style={{ perspective: '1000px' }}>
                {showcaseFeatures.map((feature, index) => {
                  const length = showcaseFeatures.length;
                  let offset = index - featureIndex;

                  if (offset > length / 2) {
                    offset -= length;
                  } else if (offset < -length / 2) {
                    offset += length;
                  }
                  
                  return (
                    <MotionDiv
                      key={feature.id}
                      className="absolute w-72 h-48 bg-gray-800/80 border border-gray-700/60 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
                      initial={false}
                      animate={{
                        x: `${offset * 60}%`,
                        scale: 1 - Math.abs(offset) * 0.2,
                        opacity: 1 - Math.abs(offset) * 0.4,
                        zIndex: showcaseFeatures.length - Math.abs(offset),
                      }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    >
                      <feature.icon className="w-10 h-10 text-blue-400 mb-3" />
                      <h3 className="font-bold text-white">{feature.title}</h3>
                      <p className="text-base text-gray-400 mt-1">{feature.description}</p>
                    </MotionDiv>
                  );
                })}
                <button
                  onClick={() => handleManualNavigation('prev')}
                  className="absolute left-0 sm:left-4 md:-left-8 top-1/2 -translate-y-1/2 z-50 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-full text-white transition-colors"
                  aria-label="Previous feature"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => handleManualNavigation('next')}
                  className="absolute right-0 sm:right-4 md:-right-8 top-1/2 -translate-y-1/2 z-50 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-full text-white transition-colors"
                  aria-label="Next feature"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </section>

          {/* Free Trial Section */}
          <section id="free-trial" className="py-20">
            <div className="container mx-auto px-6">
                <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="flex-1">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Not Ready to Commit?</h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-2xl">
                            Sign up for a 7-day free trial and experience the full power of our AI study tools. No credit card required, no strings attached.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={onOpenTrialModal}
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-transparent border-2 border-blue-500 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/50"
                        >
                            <span className="relative z-10 flex items-center">
                                Join Trial Waitlist
                                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
          </section>

          {/* Pricing Section */}
           <section id="pricing" className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, All-Inclusive Pricing</h2>
                <p className="mt-4 text-gray-400 max-w-xl mx-auto">One plan. Unlimited access. Unlock your full potential.</p>
              </div>
              <div className="flex justify-center">
                  <div className="w-full max-w-md bg-gray-800/80 border border-blue-500/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
                      <div className="text-center">
                          <h3 className="text-2xl font-semibold text-white">Focus.AI Pro</h3>
                          <div className="my-4">
                              <span className="text-5xl font-extrabold text-white">₹499</span>
                              <span className="text-gray-400">/year</span>
                          </div>
                      </div>
                      <div className="mt-6 bg-blue-900/50 border border-blue-500/30 text-blue-200 p-3 rounded-md text-sm text-left">
                          <p className="font-bold flex items-center gap-2"><Star size={16} className="text-yellow-400"/> Special Deal for OPTOBHARAT Members</p>
                          <p className="mt-1">Get <strong className="text-white">60% OFF</strong> for a limited time! Pay only <strong className="text-white">₹199/year</strong>. Your discount will be applied at checkout when you use the member coupon code.</p>
                      </div>
                      <ul className="mt-8 space-y-3">
                          {pricingFeatures.map(feature => (
                              <li key={feature} className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                  <span className="text-gray-300">{feature}</span>
                              </li>
                          ))}
                      </ul>
                      <button
                          onClick={onSubscribe}
                          className="mt-8 w-full group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-blue-700 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/50"
                      >
                          Get Started Today
                      </button>
                  </div>
              </div>
            </div>
          </section>

           {/* Use Cases Section */}
           <section id="use-cases" className="py-20 bg-gray-900/50 backdrop-blur-sm">
             <div className="container mx-auto px-6">
               <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-bold text-white">10 Ways to Supercharge Your Studies</h2>
                 <p className="mt-4 text-gray-400 max-w-2xl mx-auto">Focus.AI is more than a chatbot. It's a complete toolkit to help you learn smarter, not just harder.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {useCases.map((useCase, index) => (
                    <MotionDiv 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-gray-800/60 border border-gray-700/50 rounded-lg"
                    >
                      <div className="flex-shrink-0 bg-gray-700/80 text-blue-400 rounded-lg p-2">
                        <useCase.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{useCase.title}</h3>
                        <p className="text-base text-gray-400 mt-1">{useCase.description}</p>
                      </div>
                    </MotionDiv>
                  ))}
               </div>
             </div>
           </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Trusted by Future Optometrists</h2>
              </div>
              <MotionDiv
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {testimonials.map((testimonial, index) => (
                  <MotionDiv
                    key={index}
                    variants={itemVariants}
                    className="bg-gray-800/80 border border-gray-700/60 rounded-lg p-6"
                  >
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-base text-gray-400">{testimonial.title}</p>
                    </div>
                  </MotionDiv>
                ))}
              </MotionDiv>
            </div>
          </section>
          
          {/* Final CTA Section */}
          <section className="py-24 text-center">
              <div className="container mx-auto px-6">
                   <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Elevate Your Studies?</h2>
                   <p className="mt-4 text-gray-400 max-w-xl mx-auto">Join fellow students and transform the way you learn optometry.</p>
                    <div className="mt-8">
                      <button
                        onClick={onSubscribe}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-700 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/50"
                      >
                        <span className="relative z-10 flex items-center">
                          Unlock Full Access
                          <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </button>
                  </div>
              </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-800">
          <div className="container mx-auto px-6 py-6 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} Focus.AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
