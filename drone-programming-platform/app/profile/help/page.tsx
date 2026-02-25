import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { BookOpen, LifeBuoy, FileText, MessageSquare, ExternalLink } from 'lucide-react'

export default function HelpPage() {
    const FAQS = [
        {
            q: "How do I earn badges?",
            a: "Badges are earned by completing missions, reaching milestones (like a 7-day streak), or demonstrating specific skills like 'Perfect Landing' accuracy."
        },
        {
            q: "Can I reset my progress?",
            a: "Currently, progress reset is not available directly. If you wish to start over, please contact support for a manual reset."
        },
        {
            q: "My drone isn't connecting, what should I do?",
            a: "Ensure your drone is powered on and within range. Check your Wi-Fi connection and make sure no other software is controlling the drone. Visit the Hardware section for detailed troubleshooting."
        },
        {
            q: "How do I share my code with friends?",
            a: "You can add missions to your Portfolio and then use the 'Share' button to generate a public link to your solution."
        }
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Help & Support</h2>
                <p className="text-muted-foreground">Find answers to common questions and access platform documentation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle>Documentation</CardTitle>
                            <CardDescription>Browse the full platform guide.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Open Docs <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <CardTitle>Community Forum</CardTitle>
                            <CardDescription>Get help from other students.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Join Discussion <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <LifeBuoy className="w-5 h-5 text-green-500" />
                        Frequently Asked Questions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {FAQS.map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                                <AccordionTrigger className="text-sm font-bold text-left hover:text-primary transition-colors">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <div className="p-8 bg-muted/50 rounded-2xl border border-border text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-foreground">Still need help?</h3>
                    <p className="text-sm text-muted-foreground">Our support team is available Mon-Fri, 9am - 5pm.</p>
                </div>
                <Button className="bg-primary text-primary-foreground">Contact Support</Button>
            </div>
        </div>
    )
}
