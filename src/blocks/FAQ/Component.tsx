import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { RichText } from '@/components/RichText'

export const FAQBlock: React.FC<FAQBlockProps> = ({ heading, items }) => {
  if (!items?.length) return null

  return (
    <section className="container">
      <div className="grid gap-8 md:grid-cols-[minmax(12rem,0.7fr)_1.3fr]">
        <h2 className="font-display text-3xl font-semibold text-[var(--color-text-primary)]">
          {heading}
        </h2>
        <Accordion
          className="border-t border-[var(--color-border-subtle)]"
          type="single"
          collapsible
        >
          {items.map((item, index) => (
            <AccordionItem
              className="border-[var(--color-border-subtle)]"
              key={item.id || index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="font-accent text-base font-semibold text-[var(--color-text-primary)] hover:text-primary hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--color-text-secondary)]">
                <RichText data={item.answer} enableGutter={false} enableProse={false} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
