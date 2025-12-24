'use client';
import React from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Search, Bell, ShoppingBag, Users, CreditCard, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export const Hero: React.FC = () => {
   return (
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
         {/* Background Effects */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-primary/20 rounded-[100%] blur-[120px] opacity-50 pointer-events-none" />
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border backdrop-blur-sm mb-8 animate-fade-in-up cursor-default hover:border-primary/50 transition-colors">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span className="text-sm font-medium text-foreground">v2.0 is now live in Nepal</span>
               <ArrowRight className="w-3 h-3 text-muted-foreground ml-1" />
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-5xl animate-fade-in-up delay-100 leading-[1.1]">
               The Operating System for <br className="hidden md:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60">
                  Nepali Commerce
               </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl animate-fade-in-up delay-200 leading-relaxed">
               Pasaal gives you the power to create a world-class online store, accept eSewa & Khalti payments, and manage logistics — all without writing a line of code.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-fade-in-up delay-300">
               <Link href="/sign-up">
                  <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                     Start Your Free Trial
                  </Button>
               </Link>
               <Link href="#features">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full bg-background/50 backdrop-blur-sm hover:bg-muted/50">
                     <Play className="w-4 h-4 mr-2" /> View Demo Store
                  </Button>
               </Link>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative w-full max-w-6xl mx-auto animate-fade-in-up delay-500 [perspective:2000px]">
               <div className="relative bg-gray-900/5 dark:bg-white/5 rounded-xl p-2 ring-1 ring-inset ring-foreground/10 lg:rounded-2xl lg:p-4 backdrop-blur-sm transform rotate-x-[15deg] transition-transform duration-700 hover:rotate-x-0 origin-top">

                  <div className="rounded-lg overflow-hidden bg-card border border-border shadow-2xl flex flex-col min-h-[500px] md:min-h-[600px]">

                     {/* Browser Toolbar */}
                     <div className="h-12 bg-muted/30 border-b border-border flex items-center px-4 gap-4 justify-between">
                        <div className="flex gap-1.5">
                           <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                           <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                        </div>
                        <div className="hidden md:flex flex-1 max-w-xl mx-auto h-8 bg-background rounded-md border border-border/50 text-xs items-center px-3 text-muted-foreground font-mono shadow-sm">
                           <span className="text-muted-foreground/50 mr-2">https://</span>
                           app.pasaal.com/dashboard
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                              <Bell className="w-4 h-4 text-muted-foreground" />
                           </div>
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 border border-border"></div>
                        </div>
                     </div>

                     {/* Dashboard Layout */}
                     <div className="flex-1 flex overflow-hidden">

                        {/* Sidebar */}
                        <div className="w-64 border-r border-border bg-muted/10 hidden md:flex flex-col p-4 gap-2">
                           {['Overview', 'Orders', 'Products', 'Customers', 'Analytics', 'Discounts'].map((item, i) => (
                              <div key={item} className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 cursor-pointer ${i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}>
                                 <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-transparent border border-muted-foreground/30'}`}></div>
                                 {item}
                              </div>
                           ))}
                           <div className="mt-auto p-4 bg-muted/20 rounded-xl border border-border">
                              <p className="text-xs font-semibold text-foreground mb-1">Pro Plan</p>
                              <p className="text-[10px] text-muted-foreground mb-3">Your store is growing fast!</p>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                 <div className="h-full w-[80%] bg-primary rounded-full"></div>
                              </div>
                           </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/50">

                           {/* Header */}
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                              <div>
                                 <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                                 <p className="text-sm text-muted-foreground">Welcome back, Kathmandu Gears</p>
                              </div>
                              <div className="flex gap-2">
                                 <Button variant="outline" size="sm">Export</Button>
                                 <Button size="sm">Add Product</Button>
                              </div>
                           </div>

                           {/* Stats Grid */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                              {[
                                 { label: 'Total Sales', val: 'NPR 245,000', change: '+12%', icon: CreditCard, color: 'text-blue-500' },
                                 { label: 'Active Orders', val: '24', change: '+4', icon: ShoppingBag, color: 'text-orange-500' },
                                 { label: 'Store Visits', val: '1,205', change: '+18%', icon: Users, color: 'text-purple-500' }
                              ].map((stat, i) => (
                                 <div key={i} className="p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                       <div className={`p-2 rounded-lg bg-background border border-border ${stat.color} bg-opacity-10`}>
                                          <stat.icon className="w-4 h-4" />
                                       </div>
                                       <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-foreground">{stat.val}</h3>
                                 </div>
                              ))}
                           </div>

                           {/* Chart & Recent Orders Split */}
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                              {/* Chart Area */}
                              <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm">
                                 <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-semibold text-foreground">Revenue Over Time</h3>
                                    <select className="bg-transparent text-sm text-muted-foreground border-none outline-none cursor-pointer">
                                       <option>Last 7 Days</option>
                                    </select>
                                 </div>
                                 <div className="h-48 flex items-end justify-between gap-2">
                                    {[35, 55, 40, 70, 50, 85, 60, 90, 75, 55, 80, 65].map((h, i) => (
                                       <div key={i} className="flex-1 bg-muted/30 rounded-t-sm relative group cursor-pointer">
                                          <div
                                             style={{ height: `${h}%` }}
                                             className="absolute bottom-0 w-full bg-primary/80 rounded-t-sm transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                          ></div>
                                          {/* Tooltip on hover */}
                                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border shadow-lg pointer-events-none z-10">
                                             Rs {h * 1000}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Recent Transactions */}
                              <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
                                 <h3 className="font-semibold text-foreground mb-4">Recent Orders</h3>
                                 <div className="space-y-4">
                                    {[
                                       { name: 'Ram Sharma', item: 'Nike Air Max', price: 'Rs 12,500', time: '2m ago', method: 'eSewa' },
                                       { name: 'Sita Karki', item: 'Cotton Saree', price: 'Rs 4,200', time: '15m ago', method: 'Khalti' },
                                       { name: 'Ramesh B.', item: 'Gaming Mouse', price: 'Rs 3,100', time: '1h ago', method: 'COD' },
                                    ].map((order, i) => (
                                       <div key={i} className="flex items-center justify-between group cursor-pointer">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {order.name.charAt(0)}
                                             </div>
                                             <div>
                                                <p className="text-sm font-medium text-foreground">{order.name}</p>
                                                <p className="text-xs text-muted-foreground">{order.item}</p>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-sm font-medium text-foreground">{order.price}</p>
                                             <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                                                {order.method === 'eSewa' && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                                                {order.method === 'Khalti' && <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>}
                                                {order.method === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
                                                {order.method}
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                                 <Button variant="ghost" size="sm" className="w-full mt-auto pt-4 text-muted-foreground hover:text-primary">
                                    View All Orders <ArrowUpRight className="w-3 h-3 ml-1" />
                                 </Button>
                              </div>
                           </div>

                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </section>
   );
};