export const dynamic = "force-dynamic";

export default function ContactPage() {
  const email = (process.env.CONTACT_EMAIL ?? process.env.SUPER_ADMIN_EMAIL ?? "").trim();
  const phone = (process.env.CONTACT_PHONE ?? "").trim();
  const officeHours = (
    process.env.CONTACT_OFFICE_HOURS ?? "Monday–Friday • 9:00–17:00 WAT"
  ).trim();

  const phoneDigits = phone.replace(/[^\d]/g, "");
  const telHref = phoneDigits ? `tel:+${phoneDigits}` : null;
  const whatsappHref = phoneDigits ? `https://wa.me/${phoneDigits}` : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          For membership support, technical issues, or official inquiries, please
          reach the alumni executive team via the contact channels below.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Email</div>
          <p className="mt-2 text-sm text-zinc-600">
            Use the official address for support and verification questions.
          </p>
          <p className="mt-4 text-sm">
            {email ? (
              <a className="underline" href={`mailto:${email}`}>
                {email}
              </a>
            ) : (
              <span className="text-zinc-600">Not provided yet.</span>
            )}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Phone / WhatsApp</div>
          <p className="mt-2 text-sm text-zinc-600">
            For urgent matters, contact the regional coordinator.
          </p>
          {phone ? (
            <div className="mt-4 space-y-1 text-sm">
              <div className="text-zinc-900">{phone}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600">
                {telHref ? (
                  <a className="underline" href={telHref}>
                    Call
                  </a>
                ) : null}
                {whatsappHref ? (
                  <a
                    className="underline"
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">Not provided yet.</p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-sm font-medium">Office hours</div>
          <p className="mt-2 text-sm text-zinc-600">
            Replies typically within 24–72 hours (time zone aware).
          </p>
          <p className="mt-4 text-sm text-zinc-900">{officeHours}</p>
        </div>
      </div>
    </div>
  );
}

