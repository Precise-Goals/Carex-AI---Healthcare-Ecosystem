import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub, FaCode } from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";

export default function Footer() {
  return (
    <footer className="foote">
      <h1 className="hed">CAREX</h1>
      <p>
        CareX is an AI-powered doctor platform designed to make healthcare
        accessible, secure, and multilingual. It combines AI-trained MBBS
        models, doctor consultations, blockchain security, and e-pharmacy
        integration to provide end-to-end healthcare support.
      </p>
      <h4 className="mail">
        Still have questions? Email us at{" "}
        <a href={`mailto:${siteConfig.links.email}`} className="underline">
          {siteConfig.links.email}
        </a>
      </h4>
      <h3 className="cpy">Made by Falcons - All Rights Reserved 2025</h3>
    </footer>

    // <footer className="border-t mt-20 py-10">
    //   <div className="max-w-6xl mx-auto py-8 px-5">
    //     <div className="flex flex-col md:flex-row justify-between items-center">
    //       <div className="flex items-center space-x-2 mb-4 md:mb-0">
    //         <Link
    //           href="/"
    //           title={siteConfig.name}
    //           className="flex items-center space-x-2"
    //         >
    //           <Icons.logo className="w-auto h-[30px]" />
    //           <span className="font-bold text-xl">{siteConfig.name}</span>
    //         </Link>
    //       </div>

    //       <div className="flex items-center space-x-6">
    //         <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
    //           <FaTwitter size={20} />
    //         </Link>
    //         <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
    //           <FaLinkedin size={20} />
    //         </Link>
    //         <Link href="#" aria-label="Portfolio" className="text-muted-foreground hover:text-primary transition-colors">
    //           <CgWebsite size={20} />
    //         </Link>
    //       </div>
    //     </div>

    //     <div className="text-center mt-6 ">
    //       <span className="text-sm text-muted-foreground">
    //         Copyright © Made by Team Falcons - {new Date().getFullYear()}{" "}
    //         <Link href="/" className="hover:text-primary transition-colors">
    //           {siteConfig.name}
    //         </Link>
    //       </span>
    //     </div>
    //   </div>
    // </footer>
  );
}
