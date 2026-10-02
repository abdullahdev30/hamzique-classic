type StaticInfoPageContent = {
  body: string[]
  heading: string
  title: string
}

export const staticInfoPages: Record<string, StaticInfoPageContent> = {
  'about-us': {
    title: 'About Us',
    heading: 'About Us',
    body: [
      'We create elegant fashion pieces with a focus on quality, fit, and dependable customer care.',
      'This page can be replaced later with a full Payload CMS page using the same slug.',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    heading: 'Privacy Policy',
    body: [
      'We respect your privacy and only use customer information to process orders, provide support, and improve the shopping experience.',
      'You can edit or replace this page by creating a Payload page with the privacy-policy slug.',
    ],
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions',
    heading: 'Terms and Conditions',
    body: [
      'By using this website, you agree to follow the store policies shown during browsing, ordering, payment, delivery, and returns.',
      'You can edit or replace this page by creating a Payload page with the terms-and-conditions slug.',
    ],
  },
}

export function StaticInfoPage({ page }: { page: StaticInfoPageContent }) {
  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] md:text-5xl">
          {page.heading}
        </h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
          {page.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
