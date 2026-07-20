import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE_INFO } from "@/lib/site-info";

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/cancellation-policy", label: "Cancellation Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-lg font-semibold text-primary">{SITE_INFO.name}</p>
          <p className="mt-2 text-muted-foreground">
            Made by hand in a village kitchen, delivered fresh across Chennai.
          </p>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold">Contact us</p>
          <ul className="mt-3 flex flex-col gap-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${SITE_INFO.email}`} className="hover:text-primary break-all">
                {SITE_INFO.email}
              </a>
            </li>
            {SITE_INFO.phones.map((phone) => (
              <li key={phone} className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold">Where we are</p>
          <p className="mt-3 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>
              {SITE_INFO.address.line1}, {SITE_INFO.address.line2}
              <br />
              {SITE_INFO.address.line3}
            </span>
          </p>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold">Policies</p>
          <ul className="mt-3 flex flex-col gap-2 text-muted-foreground">
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {SITE_INFO.name}. All rights reserved.
      </div>
    </footer>
  );
}
