export interface LegalPageData {
  slug: string;
  title: string;
  description: string;
  content: Content[];
}

type Content = {
  title: string; // plain string
  body: string; // stringified html
};

const privacyPolicyData: LegalPageData = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  description: `Koajo, LLC. ("Koajo," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your personal information when you use our platform and services. By accessing or using Koajo, you consent to the practices described in this Privacy Policy.`,
  content: [
    {
      title: "1. Information We Collect",
      body: `
      <p>We collect various types of information as required by law to provide and improve our services, including:</p>
        <h3>a. Information You Provide Directly</h3>
        <ul>
        <li>Personal Information: Name, date of birth, email address, phone number, Social Security number (where required for verification), and mailing address.</li>
        <li>Financial Information: Bank account details, transaction history, and payout preferences.</li>
        <li>Identification Documents: Government-issued ID or SSN (for KYC verification).</li>
        </ul>
        <h3>b. Information Collected Automatically</h3>
        <ul>
        <li>Device Information: IP address, browser type, operating system, device identifiers, and network information.</li>
        <li>Usage Data: Logins, interactions with the platform, and savings pod activities.</li>
        <li>Cookies & Tracking Technologies: We use cookies and analytical tools to enhance user experience and track platform performance.</li>
        </ul>
        <h3>c. Information from Third Parties</h3>
        <ul>
        <li>Identity Verification: We partner with Stripe to verify your identity and process payments.</li>
        <li>Fraud Prevention Services: Data obtained from third-party fraud detection and AML compliance partners.</li>
        </ul>
`,
    },
    {
      title: "2. How We Use Your Information",
      body: `
        <p>We use your information to:</p>
        <ul>
        <li>Facilitate savings pod participation and transactions.</li>
        <li>Verify your identity and comply with legal requirements.</li>
        <li>Provide customer support and respond to inquiries.</li>
        <li>Improve our platform functionality, security, and user experience.</li>
        <li>Prevent fraud, money laundering, and unauthorized activity.</li>
        <li>Send electronic or physical communications, including account updates and promotional content (you may opt out of marketing emails).</li>
        </ul>`,
    },
    {
      title: "3. How We Share Your Information",
      body: `
        <p>We do not sell your personal information. However, we may share your data with:</p>
        <ul>
        <li>Service Providers: Third-party partners such as Stripe for payment processing and identity verification.</li>
        <li>Regulatory & Legal Authorities: When required by law, such as for AML compliance or fraud investigations.</li>
        <li>Business Transfers: In case of a merger, acquisition, or asset sale, your data may be transferred to the new entity.</li>
        <li>Other Users: Limited information may be visible within your savings pod for transparency purposes.</li>
        </ul>
        <h3>3.1 Payment Processing & Funds Handling</h3>
        <p>Koajo partners with Stripe, Inc. to securely manage identity verification, bank account linking, and ACH-based payment transfers. All user financial transactions on our platform are facilitated through Stripe's payment infrastructure.</p>
        <h3>When you make a contribution to a Koajo pod:</h3>
        <ul>
        <li>You authorize Koajo to debit your linked bank account on a bi-weekly basis for the amount agreed upon.</li>
        <li>Funds are temporarily held in Koajo's Stripe-connected account before being paid out to the designated user.</li>
        </ul>
        <strong>When it is your turn to receive your pod payout:</strong>
        <ul>
        <li>Koajo issues an ACH payment to your verified bank account, minus a 2.5% platform facilitation fee.</li>
        </ul>
        <p>Koajo does not store your bank login credentials or directly hold your funds. Stripe securely manages your sensitive financial data and ensures compliance with applicable financial regulations, including KYC (Know Your Customer) and AML (Anti-Money Laundering) requirements.</p>
        <p>By using Koajo, you also agree to Stripe's Connected Account Agreement.</p>`,
    },
    {
      title: "4. Data Security & Protection",
      body: `<p>We implement industry-standard security measures, including encryption, secure storage, and access controls, to protect your data. However, no online service can guarantee absolute security. Users are responsible for safeguarding their login credentials.</p>`,
    },
    {
      title: "5. Data Retention Policy",
      body: `
        <p>At Koajo, we value the privacy and security of our users' personal data. This Data Retention & Deletion Policy outlines how we collect, store, retain, and delete user information in compliance with applicable laws and regulations. We retain your information as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Our data retention periods are as follows:</p>
        <h3>5.1 Data Retention</h3>
        <p>Koajo retains user data only as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Our data retention periods are as follows:</p>
        <h3>5.1.1 Account & Profile Information</h3>
        <ul>
        <li>Personal information (e.g., name, email, phone number, and payout details) is retained for as long as the account remains active.</li>
        <li>If an account is inactive for 24 months, we may delete the data unless required for legal or regulatory compliance.</li>
        </ul>
        <h3>5.1.2 Transaction & Payment Data</h3>
        <p>Financial transactions, contributions to pods, and payout records are retained for 7 years to comply with financial regulations and auditing requirements.</p>
        <h3>5.1.3 Communications & Support Data</h3>
        <p>Messages exchanged with Koajo's support team are retained for 2 years after the last interaction.</p>
        <h3>5.1.4 Device & Usage Data</h3>
        <p>Analytical data used to improve services is retained for 3 years, after which it is anonymized or deleted.</p>
        <h3>5.2 Data Deletion</h3>
        <p>Users have the right to request deletion of their personal data under certain conditions. Data deletion requests can be made by contacting <a href="mailto:operations@koajo.com">operations@koajo.com</a>.</p>
        <h3>5.2.1 Account Deletion</h3>
        <ul>
        <li>Users can request account deletion at any time. Upon verification, Koajo will delete personal data within 30 days, unless retention is required by law.</li>
        <li>Transactional records associated with financial activity will be maintained as mandated by legal and compliance obligations.</li>
        </ul>
        <h3>5.2.2 Automated Deletion</h3>
        <p>If an account remains inactive for 24 months, it may be deleted after prior notification to the user.</p>
        <h3>5.2.3 Exceptions</h3>
        <p>Data may be retained beyond standard retention periods if required to meet legal, tax, regulatory, or fraud prevention obligations.</p>
        <h3>5.3. Data Security & Protection</h3>
        <p>We implement robust security measures to protect stored data from unauthorized access, alteration, or deletion.</p>
        <h3>5.4. Changes to This Policy</h3>
        <p>Koajo reserves the right to update this policy periodically. Users will be notified of significant changes through email or in-app notifications.</p>
        <h3>Data and Transaction Recordkeeping</h3>
        <p>Koajo retains records of all contributions, payouts, user verification, and related transaction metadata for up to 7 years in accordance with financial compliance obligations. This includes identity verification (KYC), pod participation history, and fee calculations.</p>
        <p>These records are stored securely and are accessible only to authorized personnel for audit, fraud prevention, and regulatory compliance.</p>
        <p>By using Koajo, you acknowledge and agree to the terms outlined in this policy.</p>
        <p>To exercise these rights, contact us at <a href="mailto:operations@koajo.com">operations@koajo.com</a>.</p>`,
    },
    {
      title: "6. Your Privacy Rights",
      body: `
        <p>Depending on your location, you may have rights to:</p>
        <ul>
        <li>Access, update, or correct your personal data.</li>
        <li>Request data deletion (subject to legal and regulatory constraints).</li>
        <li>Opt-out of marketing communications.</li>
        <li>Object to or restrict data processing in certain cases.</li>
        </ul>
        <p>To exercise these rights, contact us at <a href="mailto:support@koajo.com">support@koajo.com</a>.</p>
        <p>By using Koajo, you acknowledge and agree to the terms outlined in this policy.</p>`,
    },
    {
      title: "7. Cookies & Tracking Technologies",
      body: `<p>We use cookies to improve user experience, analyze trends, and track engagement. You can adjust cookie settings in your browser, but disabling cookies may affect platform functionality.</p>`,
    },
    {
      title: "8. Third-Party Links & Services",
      body: `<p>Koajo may contain links to third-party websites or services. We are not responsible for their privacy practices. Please review their policies before sharing personal information.</p>`,
    },
    {
      title: "9. Children's Privacy",
      body: `<p>Koajo is not intended for individuals under 18. We do not knowingly collect data from minors. If we learn that a minor has provided personal data, we will delete it.</p>`,
    },
    {
      title: "10. Changes to This Privacy Policy",
      body: `<p>We may update this Privacy Policy periodically. Changes will be posted with a revised "Last Updated" date. Continued use of Koajo after updates constitutes acceptance of the revised policy.</p>`,
    },
    {
      title: "11. Notice to California Users",
      body: `
        <p>This notice is provided in accordance with the California Consumer Privacy Act (CCPA) and other applicable California privacy laws. It supplements the information contained in Koajo's Privacy Policy and applies solely to individuals residing in the State of California. As a California resident, you have specific rights regarding your personal information, including:</p>
        <ul>
        <li><strong>Right to Know</strong> - You may request information about the categories of personal information we collect, the purposes for which we use it, and the third parties with whom we share it.</li>
        <li><strong>Right to Access</strong> - You may request access to the specific pieces of personal information we have collected about you.</li>
        <li><strong>Right to Delete</strong> - You may request that we delete personal information we have collected from you, subject to certain legal exceptions.</li>
        <li><strong>Right to Opt-Out</strong> - You may opt out of the sale or sharing of your personal information (Koajo does not sell your personal information).</li>
        <li><strong>Right to Non-Discrimination</strong> - You have the right to not be discriminated against for exercising your privacy rights.</li>
        </ul>
        <h3>2. Categories of Personal Information We Collect:</h3>
        <p>Koajo collects personal information from California residents, including but not limited to:</p>
        <ul>
        <li>Identifiers (e.g., name, email address, SSN, phone number)</li>
        <li>Financial information (e.g., payment details, transaction history)</li>
        <li>Internet or device activity (e.g., browsing behavior on our platform)</li>
        <li>Geolocation data (if permitted by you)</li>
        </ul>
        <p>How to Exercise Your Rights: To submit a request to access, delete, or opt-out, please contact us at <a href="mailto:support@koajo.com">support@koajo.com</a> or visit koajo.com to verify your identity. We may require additional information from you.</p>
        <p>Authorized Agents: You may designate an authorized agent to make a request on your behalf. We will require proof of authorization and verification of your identity.</p>
        <p>Do Not Track Signals: Koajo does not respond to Do Not Track (DNT) signals at this time. This Privacy Policy will be updated to reflect our practices if we decide to respond to DNT signals in the future.</p>
        <p>Updates to This Notice: We may update this notice periodically to reflect changes in our privacy practices. Any modifications will be effective upon posting.</p>
        <p>For more details, please contact us at <a href="mailto:support@koajo.com">support@koajo.com</a>.</p>
        <p>Thank you for trusting Koajo.</p>`,
    },
    {
      title: "12. Contact Us",
      body: `<p>For questions about this Privacy Policy, please contact us at: Koajo, LLC. Email: <a href="mailto:support@koajo.com">support@koajo.com</a></p>`,
    },
  ],
};

const termsOfUseData: LegalPageData = {
  slug: "terms-of-use",
  title: "Terms",
  description: `Welcome to Koajo! By accessing and using our platform, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.`,
  content: [
    {
      title: "Introduction",
      body: `<p>Koajo is a digital platform modernizing the traditional rotating savings system, allowing users to participate in structured savings pools. These Terms of Use govern your use of Koajo, outlining your rights and responsibilities as a user.</p>`,
    },
    {
      title: "Deposits, Holds and Payouts",
      body: `<p>When you join a Koajo savings pool:</p>
<ul>
  <li>You authorize Koajo to debit your linked bank account on a weekly basis for the amount you have agreed to save.</li>
  <li>These contributions are held temporarily in Koajo's Stripe-connected account and are in transit to another member's payout.</li>
  <li>When eligible, you will receive your payment (payout) equal to your pool amount multiplied by the number of members in a 2-3 business day window, which is managed by Koajo for fair distribution and platform maintenance.</li>
</ul>`,
    },
    {
      title: "Bank Account Verification",
      body: `<p>To participate in any savings pool, users must:</p>
<ul>
  <li>Successfully complete Know Your Customer (KYC) verification through Stripe Identity.</li>
  <li>Securely connect their US bank account via Stripe Financial Connections.</li>
</ul>`,
    },
    {
      title: "Funds Diversity and Transfers",
      body: `<ul>
  <li>Koajo only accepts and transfers US funds.</li>
  <li>Contributions and disbursed payouts are processed via ACH transfers.</li>
  <li>Funds are temporarily stored in a Stripe-managed escrow account in accordance with their regulatory and security policies.</li>
  <li>Koajo is not a bank, and not insured or protected by Koajo beyond the Stripe platform's safeguards.</li>
  <li>By using Koajo, you agree to the terms of use described in this section.</li>
</ul>`,
    },
    {
      title: "USA PATRIOT ACT DISCLOSURE",
      body: `<p><strong>IMPORTANT INFORMATION ABOUT PROCEDURES FOR OPENING A NEW USER ACCOUNT</strong></p>
<p>To help the government fight the funding of terrorism and money laundering activities, the USA PATRIOT Act requires all financial institutions and businesses or digital platforms that involve money, including Koajo, to obtain, verify, and record information that identifies each person or entity who opens an account.</p>`,
    },
    {
      title: "What Information We Collect",
      body: `<p>When you open an account with Koajo, we will ask for your name, address, date of birth, and other identifying information that will allow us to verify your identity. We may also ask to see your government-issued identification such as your driver's license or passport or other identifying documents.</p>`,
    },
    {
      title: "Why We Collect This Information",
      body: `<p>In accordance with federal law and in compliance with AML policies, this information is collected to prevent identity theft, fraud, money laundering, and other financial crimes. Koajo is committed to protecting the integrity of the platform and ensuring compliance with all applicable regulations.</p>`,
    },
    {
      title: "Confidentiality & Security",
      body: `<p>Koajo takes your privacy seriously. The information collected as part of the identity verification process is securely stored and protected in compliance with applicable privacy laws and regulations.</p>`,
    },
    {
      title: "Eligibility & Account Registration",
      body: `<ul>
  <li>You must be at least 18 years old and a US citizen or other U.S. person to use Koajo.</li>
  <li>Koajo is not available to residents of New York, Maryland, or other locations where local regulations prohibit its use.</li>
  <li>You must provide accurate and complete information during registration.</li>
  <li>You must have a valid US bank account.</li>
  <li>You must have successfully completed identity verification through our 3rd-party verification partners (KYC/AML completed).</li>
  <li>By creating an account, you agree to receive disclosures and to obtain information.</li>
</ul>`,
    },
    {
      title: "How Koajo Works",
      body: `<ul>
  <li>Users join or create savings pools, contributing a fixed amount at pre-determined intervals for a pre-determined period.</li>
  <li>The payout to each member happens in a pre-determined sequence, typically in advance after 1 or more contributions have been made. Koajo is not a loan; it is more like borrowing money from your future, only without interest.</li>
  <li>Users are responsible for maintaining their active contributions and are liable to contribute all contributions in their savings pool, especially after receiving their payout.</li>
</ul>`,
    },
    {
      title: "Fees & Charges",
      body: `<ul>
  <li>There are no interest charges.</li>
  <li>Koajo applies a small processing 2.5% fee when users receive a payout in exchange for using Koajo. These fees are deducted from funds at the time they are transferred to the user.</li>
  <li>Koajo can change its fees at any time.</li>
  <li>Koajo reserves the right to, from time to time, waive or reduce fees as part of a promotional strategy or in the best interest of its users.</li>
  <li>Koajo reserves the right at any time to change its fees and pricing methods with immediate effect after a notice delivery to its users via app or email notifications to you.</li>
</ul>`,
    },
    {
      title: "Payment Obligations & Defaults",
      body: `<ul>
  <li>Users must contribute to their savings pools on time as per the set schedule.</li>
  <li>Koajo will automatically withdraw your agreed upon contributions from your account if there are sufficient funds available in your account.</li>
  <li>For payment reversal, a 2-day grace period is granted. Users who have not received a payout and have a payment in the Koajo, are removed from the pool. Users who have received a payout and fail to pay within 30 days may be reported to credit bureaus.</li>
  <li>Users experiencing issues with contributions, payouts, or transactions should first contact Koajo's customer support to seek resolution.</li>
  <li>If a formal resolution cannot be reached, users may initiate a dispute by submitting a formal complaint through Koajo's dispute resolution process at <strong>support@koajo.com</strong>.</li>
  <li>Koajo may engage 3rd party mediation services to help resolve disputes if they are not efficiently.</li>
  <li>If a user has received a payout and fails to fulfill their financial obligations, Koajo reserves the right to take legal action to recover the amount owed.</li>
  <li>By using Koajo, you explicitly agree to cooperate fully with Koajo in any efforts to recover outstanding amounts, including providing necessary information and responding to communications from Koajo or its authorized agents.</li>
  <li>Koajo is not responsible for any fees or charges incurred by you from your bank or other financial institutions due to insufficient funds or other issues related to your contributions.</li>
  <li>Consistent contributions are essential to maintaining the integrity of the pool.</li>
  <li>Users who initiate a chargeback without first seeking resolution through Koajo may be subject to account suspension or termination.</li>
  <li>Koajo reserves the right to dispute any fraudulent chargebacks and provide evidence to the financial institutions regarding transaction history.</li>
  <li>By using Koajo, you are authorizing our payment or merchant partner to make deposits or withdrawals from any bank account you link from your internet bank account in accordance with our billing methods, third-party online payment processors.</li>
</ul>`,
    },
    {
      title: "Security & Compliance",
      body: `<ul>
  <li>Koajo follows U.S. regulatory standards to ensure compliance and security.</li>
  <li>User accounts undergo daily analysis to prevent fraud.</li>
  <li>All transactions are encrypted and securely processed.</li>
</ul>`,
    },
    {
      title: "Anti-Money Laundering (AML) Compliance",
      body: `<ul>
  <li>Koajo is committed to preventing money laundering and terrorist financing in compliance with US regulations.</li>
  <li>All users must undergo Know Your Customer (KYC) verification before participating in savings pools.</li>
  <li>Suspicious transactions may be flagged and reported to the relevant financial authorities.</li>
  <li>Users must not engage in any activity intended to disguise the source of funds or circumvent AML regulations.</li>
  <li>Koajo reserves the right to freeze accounts suspected of AML activities and report them to law enforcement authorities.</li>
</ul>`,
    },
    {
      title: "Electronic Communications Consent",
      body: `<ul>
  <li>By using Koajo, you consent to receive electronic communications from us, including but not limited to account notifications, legal disclosures, promotional messages, and customer support communications.</li>
  <li>These communications may be delivered via email, in-app notifications, or SMS, depending on your account settings.</li>
  <li>You acknowledge that electronic communications satisfy any legal requirement that such communications be in writing.</li>
  <li>You may opt out of promotional emails at any time; however, essential account-related communications cannot be opted out of.</li>
</ul>`,
    },
    {
      title: "Cancellations, Refunds & Withdrawals",
      body: `<ul>
  <li>Users cannot withdraw funds arbitrarily from a pool once a round has begun (the pool's payout period is).</li>
  <li>All contributions made to pools are final and non-refundable once processed, as funds are distributed among members according to the agreed-upon schedule.</li>
  <li>In case of accidental or duplicate transactions or errors that incur charges, users may submit a refund request within 3 business days of the transaction for review.</li>
  <li>Refunds, if approved for extenuating circumstances, will be processed within 5-7 business days and returned to the original payment method, where Koajo's 2.5% fee is applicable.</li>
  <li>If a user wishes to leave a pool before completing the cycle, they must contact support at <strong>support@koajo.com</strong> for further assistance.</li>
</ul>`,
    },
    {
      title: "Declined and Failed Payments",
      body: `<ul>
  <li>If a contribution or payout fails due to incorrect bank details, insufficient funds, or system errors, Koajo will automatically notify the user and re-initiate the transaction. Users are responsible for ensuring their bank account information is accurate and up-to-date.</li>
  <li>If you believe there has been an error with your pool contribution or payout, please contact us at <strong>support@koajo.com</strong> within 14 days of the transaction for review.</li>
  <li>Koajo is not responsible for delays or failures caused by third-party payment processors or your financial institutions.</li>
</ul>`,
    },
    {
      title: "Account Suspension, Termination & Inactivity",
      body: `<ul>
  <li>Koajo reserves the right to suspend or terminate accounts found in violation of these Terms of Use, including but not limited to fraudulent activity, failure to meet payment obligations, or violation of AML policies.</li>
  <li>If a user does not join a new savings pool for 90 consecutive days, their account may be deemed inactive and is subject to suspension or closure.</li>
  <li>Koajo will notify users of impending account inactivity or suspension and provide the opportunity to reactivate their account or join a new pool.</li>
</ul>`,
    },
    {
      title: "Proprietary Rights & Intellectual Property",
      body: `<ul>
  <li>All content, trademarks, logos, and intellectual property associated with Koajo are the exclusive property of Koajo, LLC.</li>
  <li>Users are granted a limited, non-exclusive, non-transferable license to access and use Koajo for personal, non-commercial purposes only.</li>
  <li>Unauthorized reproduction, modification, distribution, or exploitation of Koajo's proprietary materials is strictly prohibited.</li>
  <li>Koajo's services and content are protected by copyright, trademark, and other laws of the United States.</li>
  <li>Any misuse or infringement of Koajo's intellectual property may result in legal action.</li>
</ul>`,
    },
    {
      title: "ACH Authorization",
      body: `<ul>
  <li>By creating an account and using Koajo, you authorize us to initiate, from your deposit bank and withdrawal (ACH) to and concurrently debit your electronically linked bank account via the Automated Clearing House (ACH) network for contributions to your savings pools and payouts.</li>
  <li>You acknowledge that ACH transactions may take several business days to process.</li>
  <li>You agree to ensure sufficient funds are available in your designated bank account for all scheduled contributions.</li>
  <li>If an ACH transaction fails due to insufficient funds, Koajo reserves the right to attempt the transaction again or charge a returned payment fee.</li>
  <li>You may revoke this authorization by contacting support at <strong>support@koajo.com</strong>; however, doing so may affect your ability to participate in savings pools.</li>
  <li>Koajo will provide you with all transaction notifications and account balances in addition to providing customer support relating to your user account.</li>
</ul>`,
    },
    {
      title: "Rules for Acceptable Use",
      body: `<ul>
  <li>Users must not engage in fraudulent activities, money laundering, or any other illegal or unauthorized use.</li>
  <li>Users agree not to manipulate a Koajo with, or a planned to exceed the round schedule.</li>
  <li>Any such activity may result in account suspension or legal action.</li>
  <li>Koajo and its platform are intended for, and directed to, residents or persons of the United States and its services, content, or advertisement are not contained of its platform, content, or applications only in the United States.</li>
  <li>Koajo makes no claim that our services are appropriate or may be accessed or used outside the United States.</li>
</ul>`,
    },
    {
      title: "Limitation of Liability",
      body: `<ul>
  <li>Koajo will not be responsible or liable to you or any third party, whether in contract, warranty, including negligence or otherwise, for any indirect, special, incidental, consequential, exemplary, or additional or punitive damages, including but not limited to loss of profit, revenue, or business or revenue, or other financial losses, or sales or data.</li>
  <li>Koajo is not responsible for losses incurred due to user non-compliance, errors, or failure to adhere to payment schedules.</li>
  <li>You acknowledge and agree that to the maximum extent permitted by law, you bear the entire risk arising out of your access and use of our service, content, or platform, or any other services.</li>
  <li>While we ensure the security of all transactions, we do not guarantee financial outcomes.</li>
</ul>`,
    },
    {
      title: "Amendment/Changes to Terms",
      body: `<ul>
  <li>Koajo reserves the right to modify these Terms of Use at any time. Users will be notified of significant changes via email or platform notifications.</li>
  <li>Continued use of the platform after changes are posted will constitute acceptance of the new terms.</li>
</ul>`,
    },
    {
      title: "Not Legal, Tax or Financial Advice Disclosure",
      body: `<p>The information provided by Koajo, including but not limited to our website, mobile application, communications, and services, is for informational purposes only and should not be construed as legal, tax, or financial advice.</p>
<p>Koajo does not provide legal, tax, or financial advice. Any content, tools, or resources made available through our platform are for general informational and educational purposes only and should not be relied upon as a substitute for professional advice from a qualified attorney, tax advisor, or financial professional.</p>
<p>Your relationship with Koajo does not create a fiduciary or professional client relationship between you and Koajo. We strongly encourage you to consult with licensed professionals before making any financial, legal, or tax-related decisions.</p>
<p>Koajo is not responsible for any decisions or actions taken based on the information provided through our platform. Users assume full responsibility for evaluating the accuracy, suitability, and reliability of any information or advice before making financial or legal commitments.</p>`,
    },
    {
      title: "Third-Party Links & Resources",
      body: `<p>Koajo may provide links to third-party websites or resources for informational purposes. We do not endorse or guarantee the accuracy of any third-party content and are not responsible for any consequences resulting from reliance on such resources.</p>
<p>By using Koajo, you acknowledge and agree that you are solely responsible for your own financial and legal decisions. If you require specialized guidance, please consult a qualified professional. You acknowledge that you have read, understood, and agree to abide by these Terms of Use.</p>`,
    },
    {
      title: "Contact & Support",
      body: `<p>For questions or concerns regarding these Terms of Use, please contact us at <strong>support@koajo.com</strong>.</p>`,
    },
  ],
};

export const legalPages: LegalPageData[] = [privacyPolicyData, termsOfUseData];
