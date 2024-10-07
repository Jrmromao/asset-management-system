import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart2, Cloud, Database, Leaf, Zap, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Component() {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-white">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b border-gray-200">
                <Link className="flex items-center justify-center" href="#">
                    <Leaf className="h-6 w-6 text-blue-600" />
                    <span className="ml-2 text-lg font-semibold text-gray-900">AssetCarbonTracker</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-600" href="#">
                        Features
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-600" href="#">
                        Pricing
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-600" href="#">
                        About
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-600" href="#">
                        Contact
                    </Link>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 border-b border-gray-200">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gray-900">Start Tracking Today</h2>
                                <p className="max-w-[600px] text-gray-500 md:text-xl">
                                    Join the growing number of companies making a positive impact on the environment.
                                </p>
                            </div>
                            <div className="w-full max-w-sm space-y-2">
                                <form className="flex space-x-2">
                                    <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
                                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Subscribe</Button>
                                </form>
                                <p className="text-xs text-gray-500">
                                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                                    Track Your Assets' Carbon Footprint
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                                    Manage your physical assets and monitor their environmental impact with ease. Make informed decisions
                                    for a sustainable future.
                                </p>
                            </div>
                            <div className="w-full max-w-3xl">
                                <Image
                                    src="/placeholder.svg?height=400&width=800"
                                    width={800}
                                    height={400}
                                    alt="Asset Management and Carbon Footprint Tracking"
                                    className="rounded-lg object-cover w-full"
                                />
                            </div>
                            <div className="space-x-4 mt-6">
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">Get Started</Button>
                                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">Learn More</Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col items-center space-y-3 text-center">
                                <Database className="h-12 w-12 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Comprehensive Asset Management</h2>
                                <p className="text-sm text-gray-500">
                                    Efficiently track and manage all your physical assets in one centralized platform.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-3 text-center">
                                <BarChart2 className="h-12 w-12 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Carbon Footprint Analytics</h2>
                                <p className="text-sm text-gray-500">
                                    Gain insights into the environmental impact of your assets with detailed carbon footprint analysis.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-3 text-center">
                                <Cloud className="h-12 w-12 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Cloud-Based Solution</h2>
                                <p className="text-sm text-gray-500">
                                    Access your asset data and reports from anywhere, anytime with our secure cloud-based platform.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-3 text-center">
                                <Zap className="h-12 w-12 text-blue-600" />
                                <h2 className="text-xl font-bold text-gray-900">Real-Time Monitoring</h2>
                                <p className="text-sm text-gray-500">
                                    Get instant updates on your assets' performance and environmental impact with our real-time monitoring system.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gray-900">Pricing Plans</h2>
                                <p className="max-w-[600px] text-gray-500 md:text-xl">
                                    Choose the plan that fits your business needs
                                </p>
                            </div>
                            <div className="grid gap-10 sm:grid-cols-2 w-full max-w-4xl">
                                <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg justify-between border border-gray-200">
                                    <div>
                                        <h3 className="text-2xl font-bold text-center text-gray-900">Standard</h3>
                                        <div className="mt-4 text-center text-gray-500">
                                            <span className="text-4xl font-bold">$99</span>/ month
                                        </div>
                                        <ul className="mt-4 space-y-2">
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Up to 1000 assets
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Basic carbon footprint analytics
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Cloud-based access
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Email support
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-6">
                                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Get Started</Button>
                                    </div>
                                </div>
                                <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg justify-between border border-gray-200">
                                    <div>
                                        <h3 className="text-2xl font-bold text-center text-gray-900">Enterprise</h3>
                                        <div className="mt-4 text-center text-gray-500">
                                            <span className="text-4xl font-bold">$299</span>/ month
                                        </div>
                                        <ul className="mt-4 space-y-2">
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Unlimited assets
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Advanced carbon footprint analytics
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                Real-time monitoring
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="text-blue-500 mr-2 h-5 w-5" />
                                                24/7 priority support
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-6">
                                        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Contact Sales</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">© 2024 AssetCarbonTracker. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    )
}