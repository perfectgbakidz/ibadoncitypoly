import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-3">Terms and Conditions</h1>
            <div className="space-y-4 text-slate-600">
                <p><strong>Last updated:</strong> October 26, 2024</p>
                <p>
                    Please read these terms and conditions carefully before using Our Service.
                </p>
                
                <h2 className="text-xl font-semibold text-slate-700 pt-4">Acknowledgment</h2>
                <p>
                    These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Library. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
                </p>
                <p>
                    Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
                </p>

                <h2 className="text-xl font-semibold text-slate-700 pt-4">User Accounts</h2>
                <p>
                    When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.
                </p>
                
                <h2 className="text-xl font-semibold text-slate-700 pt-4">Termination</h2>
                <p>
                    We may terminate or suspend Your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
                </p>

                <h2 className="text-xl font-semibold text-slate-700 pt-4">Contact Us</h2>
                <p>
                    If you have any questions about these Terms and Conditions, You can contact us by email at library@mapoly.edu.ng.
                </p>
            </div>
        </div>
    );
};

export default TermsPage;
