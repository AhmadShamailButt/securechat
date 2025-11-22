import React from 'react';
import { useNavigate } from 'react-router-dom';

import Hero from '../Components/Home/Hero';
import Features from '../Components/Home/Features';
import HowItWorks from '../Components/Home/HowItWorks';
import Button from '../Components/ui/Button';
import { ArrowRight } from 'lucide-react';


// Testimonials component for additional content
const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      content: "GoFAST Connect has made my daily commute so much more affordable. I've saved over ₨1,500 per month and made some great friends in the process!",
      author: "Aisha Fatima",
      role: "Computer Science, Batch of 2023"
    },
    {
      id: 2,
      content: "As a driver, I was spending a fortune on fuel. Now I share rides with classmates, split costs, and actually enjoy the drive to campus.",
      author: "Umar Farooq",
      role: "Electrical Engineering, Batch of 2022"
    },
    {
      id: 3,
      content: "Finding reliable transportation to FAST was always a struggle. This platform made it easy to connect with students from my area who drive to campus.",
      author: "Zainab Khan",
      role: "Business Administration, Batch of 2024"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-muted/30 dark:to-muted/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of FAST NUCES students who are already enjoying the benefits of carpooling.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block text-yellow-500 mr-1">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="mb-6 italic">{testimonial.content}</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA component for call to action section
const CTA = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/', { state: { openSignUp: true } });
  };
  return (
    <section className="py-20 bg-primary-50 dark:bg-primary-900/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="lg:max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Carpool Journey?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join the FAST NUCES carpooling community today and transform your daily commute. 
              Save money, reduce stress, and make new connections.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={handleGetStarted}>
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6 shadow-md lg:w-1/3">
            <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">2,000+</p>
                <p className="text-sm text-muted-foreground">Rides Shared</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">₨150K+</p>
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">3.5K+</p>
                <p className="text-sm text-muted-foreground">CO₂ Reduced (kg)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/', { state: { openSignUp: true } });
  };
  return (
    <div className="flex flex-col min-h-screen">

      
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      
    </div>
  );
};

export default HomePage;