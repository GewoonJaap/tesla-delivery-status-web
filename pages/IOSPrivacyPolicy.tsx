import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TeslaLogo } from '../components/icons';
import { trackEvent } from '../utils/analytics';

const IOSPrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('view_ios_privacy_policy');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">iOS App Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-tesla-gray-400 mb-8">Last Updated: March 27, 2026</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-tesla-gray-300">
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Data Collection and Storage</h2>
                <p className="mb-4">
                  We prioritize your privacy. <strong>We do not save any of your personal data, Tesla account credentials, or vehicle information on our servers.</strong> All sensitive data retrieved from the Tesla API is processed locally on your device and stored securely within the application's private storage for the purpose of tracking changes in your delivery status.
                </p>
                <p>
                  To provide users with better order estimations, we offer an optional feature to collect anonymized analytical order data (such as order dates and status changes). <strong>This is strictly opt-in, and no personally identifiable information (PII) is included in this collection.</strong> This data is used exclusively for statistical analysis and improving the accuracy of delivery predictions for the community. You can enable or disable this feature at any time in the application settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Third-Party Services</h2>
                <p className="mb-4">To improve the user experience and monitor application performance, we use the following third-party services:</p>
                <ul className="list-disc list-inside space-y-4 ml-4">
                  <li>
                    <strong>Firebase Crashlytics:</strong> We use Firebase Crashlytics to collect anonymized crash reports. This helps us identify and fix bugs that cause the application to crash or behave unexpectedly.
                  </li>
                  <li>
                    <strong>Sentry:</strong> We use Sentry for real-time error monitoring and logging. This allows us to detect and diagnose issues in the application code to ensure a stable experience.
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> We use Google Analytics to collect anonymous information about how many people use the app and which features are most popular. This data is aggregated and does not identify you personally.
                  </li>
                </ul>
                <p className="mt-4">No personally identifiable information (PII) is shared with these services.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Retention & Deletion</h2>
                <p>
                  You have full control over your data. Users can sign out, delete all locally stored tracking data, and manage data collection preferences at any time via the Settings menu in the application. Signing out or using the "Clear All Data" feature will instantly remove all locally stored information from your device. For the removal of anonymized analytical data stored on our servers, please refer to the contact information in Section 6.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Security</h2>
                <p>
                  Since we do not store your data on our servers, the security of your information primarily depends on the security of your own device. We recommend keeping your device updated and using built-in security features like FaceID or TouchID if available.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Changes to This Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Contact Us & Data Removal</h2>
                <p>
                  If you have any questions about this Privacy Policy or would like to request the removal of your anonymized analytical data, you can reach out via email at:{' '}
                  <a 
                    href="mailto:privacy@mrproper.dev" 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    privacy@mrproper.dev
                  </a>
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

export default IOSPrivacyPolicy;
