import Link from "next/link";
import PageSection from "@/components/ui/PageSection";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <div className="bg-gradient-to-br from-[#2E3192] to-[#1a1d6b] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <span className="text-sm font-semibold text-[#9DE7FF]">404</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Page Not Found</h1>
          <p className="text-gray-300 text-lg">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>
      </div>

      <PageSection background="white" className="py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-[#F5F7FA] rounded-2xl p-8 sm:p-10">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00AEEF] to-[#2E3192] text-white font-black text-2xl shadow-xl mx-auto mb-5">
              TML
            </div>
            <h2 className="text-2xl font-black text-[#231F20] mb-3">Let&apos;s get you back on track</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto mb-7">
              You can return to the homepage, browse services, or submit an enquiry and the Total Serve team will help route your request.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/">
                <Button variant="secondary" size="md">Go Home</Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="md">View Services</Button>
              </Link>
              <Link href="/enquiry">
                <Button variant="red" size="md">Submit Enquiry</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
