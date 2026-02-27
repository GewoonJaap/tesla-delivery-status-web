import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TeslaLogo } from '../components/icons';
import { trackEvent } from '../utils/analytics';
import { GITHUB_REPO_URL, DISCORD_INVITE_URL } from '../constants';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('view_privacy_policy');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-tesla-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-tesla-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Back to App
          </Link>
          <TeslaLogo className="w-8 h-8 text-tesla-red" />
        </div>

        <div className="bg-white dark:bg-tesla-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-tesla-gray-700">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-tesla-gray-400 mb-8">Last Updated: February 27, 2026</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-tesla-gray-300">
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Data Collection and Storage</h2>
                <p>
                  We prioritize your privacy. <strong>We do not save any of your personal data, Tesla account credentials, or vehicle information on our servers.</strong> All data retrieved from the Tesla API is processed locally in your browser and stored only in your browser's local storage for the purpose of tracking changes in your delivery status.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Third-Party Services</h2>
                <p className="mb-4">To improve the user experience and monitor application performance, we use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-4 ml-4">
                  <li>
                    <strong>Microsoft Clarity:</strong> We use Microsoft Clarity to understand how users interact with our website through heatmaps and session recordings. This helps us identify usability issues and improve the interface.
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> We use Google Analytics to collect anonymous information about how many people use the app and which features are most popular. This data is aggregated and does not identify you personally.
                  </li>
                  <li>
                    <strong>Firebase Crashlytics:</strong> We use Firebase Crashlytics to collect anonymized crash reports. This helps us identify and fix bugs that cause the application to crash or behave unexpectedly.
                  </li>
                  <li>
                    <strong>Sentry:</strong> We use Sentry for real-time error monitoring and logging. This allows us to detect and diagnose issues in the application code to ensure a stable experience.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Cookies and Local Storage</h2>
                <p>
                  The application uses browser local storage to keep you logged in and to store a history of your delivery status changes. No tracking cookies are used for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Security</h2>
                <p>
                  Since we do not store your data on our servers, the security of your information primarily depends on the security of your own device and browser. We recommend using a secure browser and keeping your device updated.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Changes to This Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, you can reach out via our{' '}
                  <a 
                    href={GITHUB_REPO_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    GitHub repository
                  </a>
                  {' '}or{' '}
                  <a 
                    href={DISCORD_INVITE_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Discord community
                  </a>.
                </p>
              </section>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-tesla-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-tesla-gray-700">
            <p className="text-center text-xs text-gray-500 dark:text-tesla-gray-400">
              &copy; {new Date().getFullYear()} Tesla Delivery Status. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
