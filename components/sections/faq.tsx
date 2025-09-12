import Section from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/config";

export default function FAQ() {
  return (
    <Section title="FAQ" subtitle="Frequently asked questions">
      <div className="mx-auto my-12  md:max-w-[800px]">
        <Accordion
          type="single"
          collapsible
          className=" cursor-pointer flex w-full flex-col items-center justify-center space-y-2"
        >
          {siteConfig.faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={faq.question}
              className=" w-full border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className=" cursor-pointer px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
    </Section>
  );
}
