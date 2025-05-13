
import React from "react";

export default function PrivacyPolicy() {
  return (
    <section className="px-5 py-16 flex flex-col gap-12 lg:gap-16 lg:px-16 lg:py-28 bg-white">
      <div className="flex flex-col">
        <p className="mb-3 lg:mb-4">Legal</p>
        <h2 className="uppercase mb-5 lg:mb-6">Privacy Policy</h2>
        <p>
          Your privacy is important to us. This policy outlines how we collect,
          use, and protect your personal information when you interact with our
          website or services.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2>1. Information We Collect</h2>
          <p>
            When you interact with our website or services, we may collect both
            personal and non-personal information. This includes your name,
            email address, phone number, company name, and any other
            information you voluntarily provide. Additionally, we may
            automatically collect data such as IP address, browser type, device
            information, pages visited, and usage patterns using cookies and
            similar technologies.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6">
            <li>Respond to inquiries and provide customer support</li>
            <li>Deliver and improve our services and user experience</li>
            <li>Send marketing communications (only if you’ve opted in)</li>
            <li>Analyze traffic and usage trends to improve site performance</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2>3. Cookies & Tracking Technologies</h2>
          <p>
            Our site uses cookies and similar technologies to improve
            functionality, personalize your experience, and analyze traffic.
            You can manage or disable cookies through your browser settings.
            Please note that disabling cookies may affect certain features of
            the site.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>4. Data Sharing & Third Parties</h2>
          <p>
            We do not sell your personal information. However, we may share your
            data with trusted third-party service providers who assist in
            operating our website and services — such as hosting, analytics,
            payment processing, and email delivery — under strict
            confidentiality agreements.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>5. Data Security</h2>
          <p>
            We implement technical and organizational measures to protect your
            information from unauthorized access, misuse, or loss. However, no
            method of data transmission or storage is completely secure. While
            we strive to use commercially acceptable means to protect your data,
            we cannot guarantee its absolute security.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>6. Your Rights & Choices</h2>
          <p>
            Depending on your location, you may have rights under applicable
            data protection laws, such as the GDPR or CCPA. These may include
            the right to:
          </p>
          <ul className="list-disc pl-6">
            <li>Access the personal information we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent or object to data processing</li>
            <li>Request data portability</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:team@redendron.com" className="underline">
              team@redendron.com
            </a>.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>7. Third-Party Links</h2>
          <p>
            Our website may contain links to external sites. We are not
            responsible for the content, privacy practices, or policies of those
            third-party websites. We encourage you to review the privacy
            policies of any site you visit via links from our platform.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>8. Policy Updates</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in legal requirements, technologies, or our business
            practices. When we do, we will revise the "Last Updated" date at the
            top of the page. We encourage you to review this page periodically
            to stay informed.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions, concerns, or feedback about this Privacy
            Policy, please reach out to our team at{" "}
            <a href="mailto:team@redendron.com" className="underline">
              team@redendron.com
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
