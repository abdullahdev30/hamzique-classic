import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react'

type ContactLink = {
  description: string
  href?: string
  label: string
  title: string
}

const normalizeHref = (href?: string) => href?.trim() || undefined

const contactLinks: ContactLink[] = [
  {
    description: process.env.NEXT_PUBLIC_CONTACT_PHONE_TEXT || '24/7 available customer service',
    href:
      normalizeHref(process.env.NEXT_PUBLIC_CONTACT_CALL_LINK) ||
      (process.env.NEXT_PUBLIC_CONTACT_PHONE
        ? `tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE.replace(/\s/g, '')}`
        : undefined),
    label: 'Call Us',
    title: `Get in touch ${process.env.NEXT_PUBLIC_CONTACT_PHONE || ''}`.trim(),
  },
  {
    description:
      process.env.NEXT_PUBLIC_ORDER_TRACKING_TEXT ||
      'Want to know if your order is processed and dispatched?',
    href: normalizeHref(process.env.NEXT_PUBLIC_ORDER_TRACKING_URL),
    label: 'Order Tracking',
    title: 'Track your order',
  },
  {
    description: process.env.NEXT_PUBLIC_SALES_EMAIL_TEXT || "Don't hesitate",
    href: process.env.NEXT_PUBLIC_SALES_EMAIL
      ? `mailto:${process.env.NEXT_PUBLIC_SALES_EMAIL}`
      : undefined,
    label: 'Email Us',
    title: 'For Sale Inquiry',
  },
  {
    description: process.env.NEXT_PUBLIC_LIVE_CHAT_TEXT || 'With our expert designer',
    href: normalizeHref(process.env.NEXT_PUBLIC_LIVE_CHAT_URL),
    label: 'Live Chat',
    title: 'Chat with Us',
  },
  {
    description: process.env.NEXT_PUBLIC_WHATSAPP_TEXT || 'You can whatsapp',
    href:
      normalizeHref(process.env.NEXT_PUBLIC_WHATSAPP_LINK) ||
      (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
        ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`
        : undefined),
    label: 'WhatsApp',
    title: 'WhatsApp',
  },
]

const socialLinks = [
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, icon: Instagram, label: 'Instagram' },
  { href: process.env.NEXT_PUBLIC_FACEBOOK_URL, icon: Facebook, label: 'Facebook' },
  { href: process.env.NEXT_PUBLIC_LINKEDIN_URL, icon: Linkedin, label: 'LinkedIn' },
  { href: process.env.NEXT_PUBLIC_YOUTUBE_URL, icon: Youtube, label: 'YouTube' },
]

const textSocialLinks = [
  { href: process.env.NEXT_PUBLIC_PINTEREST_URL, label: 'Pinterest', mark: 'P' },
  { href: process.env.NEXT_PUBLIC_X_URL, label: 'X', mark: 'X' },
  { href: process.env.NEXT_PUBLIC_TIKTOK_URL, label: 'TikTok', mark: 'T' },
]

const returnAddress = [
  process.env.NEXT_PUBLIC_RETURN_ADDRESS_BRAND || 'Andaaz Fashion',
  process.env.NEXT_PUBLIC_RETURN_ADDRESS_LINE_1 || 'Unit 10 Watchmoor Trade Centre',
  process.env.NEXT_PUBLIC_RETURN_ADDRESS_LINE_2 || 'Watchmoor rd, Camberley',
  process.env.NEXT_PUBLIC_RETURN_ADDRESS_LINE_3 || 'Surrey GU15 3AJ',
  process.env.NEXT_PUBLIC_RETURN_ADDRESS_COUNTRY || 'United Kingdom',
].filter(Boolean)

export function HomeContactInfo() {
  const salesEmail = process.env.NEXT_PUBLIC_SALES_EMAIL || 'sales@andaazfashion.com'

  return (
    <section className="container grid gap-8 py-10 md:grid-cols-2 md:py-14" aria-label="Contact and returns">
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] p-6 md:p-10">
        <h2 className="mb-8 text-center font-accent text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">
          Need Help?
        </h2>
        <div className="space-y-8">
          {contactLinks.map((item) => {
            const content = (
              <>
                <div>
                  <h3 className="font-accent text-lg font-semibold text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
                </div>
                <span className="inline-flex min-w-36 justify-center rounded-full border border-[var(--color-text-primary)] px-5 py-2 text-sm font-bold text-[var(--color-text-primary)] transition hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-dominant)]">
                  {item.label}
                </span>
              </>
            )

            return item.href ? (
              <a className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center" href={item.href} key={item.label}>
                {content}
              </a>
            ) : (
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center" key={item.label}>
                {content}
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)] p-6 text-center md:p-10">
        <h2 className="font-accent text-2xl font-bold text-[var(--color-text-primary)] md:text-3xl">
          Return Address
        </h2>
        <div className="mt-7 space-y-3 text-[var(--color-text-secondary)]">
          <p className="flex items-center justify-center gap-3 text-[var(--color-text-primary)]">
            <MapPin className="size-5 text-[var(--color-cta-accent)]" />
            <span>{returnAddress[0]}</span>
          </p>
          {returnAddress.slice(1).map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="pt-3">
            For Sale Inquiry:{' '}
            <a className="hover:text-[var(--color-cta-accent)]" href={`mailto:${salesEmail}`}>
              {salesEmail}
            </a>
          </p>
        </div>

        <h3 className="mt-12 font-accent text-2xl font-bold text-[var(--color-text-primary)]">
          Stay in touch
        </h3>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-8">
          {socialLinks.map(({ href, icon: Icon, label }) =>
            href ? (
              <a
                aria-label={label}
                className="text-[var(--color-cta-accent)] transition hover:scale-110"
                href={href}
                key={label}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon className="size-6" />
              </a>
            ) : null,
          )}
          {textSocialLinks.map(({ href, label, mark }) =>
            href ? (
              <a
                aria-label={label}
                className="font-accent text-2xl font-bold text-[var(--color-cta-accent)] transition hover:scale-110"
                href={href}
                key={label}
                rel="noopener noreferrer"
                target="_blank"
              >
                {mark}
              </a>
            ) : null,
          )}
          {process.env.NEXT_PUBLIC_WHATSAPP_LINK || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? (
            <a
              aria-label="WhatsApp"
              className="text-[var(--color-cta-accent)] transition hover:scale-110"
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
                `https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '')}`
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle className="size-6" />
            </a>
          ) : null}
          {process.env.NEXT_PUBLIC_SALES_EMAIL ? (
            <a
              aria-label="Email"
              className="text-[var(--color-cta-accent)] transition hover:scale-110"
              href={`mailto:${process.env.NEXT_PUBLIC_SALES_EMAIL}`}
            >
              <Mail className="size-6" />
            </a>
          ) : null}
          {process.env.NEXT_PUBLIC_CONTACT_PHONE ? (
            <a
              aria-label="Phone"
              className="text-[var(--color-cta-accent)] transition hover:scale-110"
              href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE.replace(/\s/g, '')}`}
            >
              <Phone className="size-6" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
