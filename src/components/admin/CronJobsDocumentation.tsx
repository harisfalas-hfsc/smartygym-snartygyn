import React from 'react';
import { Clock, Mail, Bell, Users, Calendar } from 'lucide-react';

export const CronJobsDocumentation = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 print:text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Page 1 - Scheduled Notifications */}
      <div className="p-8 md:p-12 max-w-[21cm] mx-auto" style={{ minHeight: '29.7cm', pageBreakAfter: 'always' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b-4 border-[#29B6D2] pb-6">
          <div className="flex items-center gap-4">
            <img 
              src="/smarty-gym-logo.png" 
              alt="SmartyGym Logo" 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-[#29B6D2]">SmartyGym</h1>
              <p className="text-sm text-gray-600">Automated Notifications & Cron Jobs</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#29B6D2]" />
              <span className="text-[#29B6D2] font-bold">System Documentation</span>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#29B6D2]" />
            Notification System Overview
          </h2>
          <p className="text-gray-300 text-sm">
            SmartyGym uses a dual-channel notification system delivering messages through both dashboard notifications 
            and email. All automated notifications respect user preferences and are processed through our cron job system.
          </p>
        </div>

        {/* Scheduled Automated Notifications Table */}
        <h3 className="text-xl font-bold mb-4 text-[#29B6D2] border-b-2 border-[#29B6D2] pb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduled Automated Notifications (Cron Jobs)
        </h3>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#29B6D2] text-white">
                <th className="border border-gray-300 p-3 text-left font-bold">What</th>
                <th className="border border-gray-300 p-3 text-left font-bold">When (Cyprus Time)</th>
                <th className="border border-gray-300 p-3 text-left font-bold">Who</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Morning Notification</strong><br/>
                  <span className="text-gray-600 text-xs">WOD + Daily Ritual combined email</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 07:00</td>
                <td className="border border-gray-300 p-3">All users (respects email_wod & email_ritual preferences)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>WOD Generation</strong><br/>
                  <span className="text-gray-600 text-xs">2 fresh workouts (bodyweight + equipment)</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 00:00</td>
                <td className="border border-gray-300 p-3">System (no notification sent)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>WOD Archive</strong><br/>
                  <span className="text-gray-600 text-xs">Previous day WODs archived</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 23:55</td>
                <td className="border border-gray-300 p-3">System (no notification sent)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Daily Ritual Generation</strong><br/>
                  <span className="text-gray-600 text-xs">Morning, midday, evening rituals</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 00:05</td>
                <td className="border border-gray-300 p-3">System (no notification sent)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Check-in Reminder (Morning)</strong><br/>
                  <span className="text-gray-600 text-xs">Morning check-in prompt</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 08:00</td>
                <td className="border border-gray-300 p-3">Opted-in users (checkin_reminders = true)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Check-in Reminder (Night)</strong><br/>
                  <span className="text-gray-600 text-xs">Night check-in prompt</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 20:00</td>
                <td className="border border-gray-300 p-3">Opted-in users (checkin_reminders = true)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Monday Motivation</strong><br/>
                  <span className="text-gray-600 text-xs">Personalized goal progress or motivation</span>
                </td>
                <td className="border border-gray-300 p-3">Mondays at 10:00</td>
                <td className="border border-gray-300 p-3">All users (respects email_monday_motivation preference)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Weekly Activity Report</strong><br/>
                  <span className="text-gray-600 text-xs">Comprehensive activity summary</span>
                </td>
                <td className="border border-gray-300 p-3">Mondays at 09:00</td>
                <td className="border border-gray-300 p-3">All users (respects email_weekly_activity preference)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Renewal Reminder</strong><br/>
                  <span className="text-gray-600 text-xs">Subscription expiring soon</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 11:00</td>
                <td className="border border-gray-300 p-3">Subscribers expiring within 3 days</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>System Health Audit</strong><br/>
                  <span className="text-gray-600 text-xs">245+ checks across platform</span>
                </td>
                <td className="border border-gray-300 p-3">Daily at 22:00</td>
                <td className="border border-gray-300 p-3">Admin email only (harisfalas@gmail.com)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="bg-[#E8F7FA] border-l-4 border-[#29B6D2] p-4 rounded-r-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> All times shown are in Cyprus time (EET/EEST). UTC offset is +2 hours in winter, +3 hours in summer.
            All notifications implement 600ms rate limiting between sends to respect Resend's API limits.
          </p>
        </div>
      </div>

      {/* Page 2 - Event-Triggered Notifications */}
      <div className="p-8 md:p-12 max-w-[21cm] mx-auto" style={{ minHeight: '29.7cm' }}>
        {/* Event-Triggered Notifications Table */}
        <h3 className="text-xl font-bold mb-4 text-[#29B6D2] border-b-2 border-[#29B6D2] pb-2 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Event-Triggered Notifications
        </h3>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#29B6D2] text-white">
                <th className="border border-gray-300 p-3 text-left font-bold">What</th>
                <th className="border border-gray-300 p-3 text-left font-bold">Trigger Event</th>
                <th className="border border-gray-300 p-3 text-left font-bold">Who</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Welcome Email</strong><br/>
                  <span className="text-gray-600 text-xs">Platform introduction & getting started</span>
                </td>
                <td className="border border-gray-300 p-3">New user signs up</td>
                <td className="border border-gray-300 p-3">New registered users</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>First Purchase Thank You</strong><br/>
                  <span className="text-gray-600 text-xs">Thank you for first subscription/purchase</span>
                </td>
                <td className="border border-gray-300 p-3">First purchase completed</td>
                <td className="border border-gray-300 p-3">First-time purchasers</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Subscription Confirmation</strong><br/>
                  <span className="text-gray-600 text-xs">Subscription activated details</span>
                </td>
                <td className="border border-gray-300 p-3">Stripe checkout.session.completed</td>
                <td className="border border-gray-300 p-3">New subscribers (Gold/Platinum)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Standalone Purchase Confirmation</strong><br/>
                  <span className="text-gray-600 text-xs">Individual workout/program purchase</span>
                </td>
                <td className="border border-gray-300 p-3">Standalone purchase completed</td>
                <td className="border border-gray-300 p-3">Standalone purchasers</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Cancellation Notice</strong><br/>
                  <span className="text-gray-600 text-xs">Subscription cancellation confirmation</span>
                </td>
                <td className="border border-gray-300 p-3">User cancels subscription</td>
                <td className="border border-gray-300 p-3">Cancelling subscribers</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Payment Failed</strong><br/>
                  <span className="text-gray-600 text-xs">Payment declined notification</span>
                </td>
                <td className="border border-gray-300 p-3">Stripe invoice.payment_failed</td>
                <td className="border border-gray-300 p-3">Users with failed payments</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>New Content Alert (Workout)</strong><br/>
                  <span className="text-gray-600 text-xs">New workout added to library</span>
                </td>
                <td className="border border-gray-300 p-3">Admin adds new workout (non-WOD)</td>
                <td className="border border-gray-300 p-3">All users (respects email_new_workout preference)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>New Content Alert (Program)</strong><br/>
                  <span className="text-gray-600 text-xs">New training program added</span>
                </td>
                <td className="border border-gray-300 p-3">Admin adds new program</td>
                <td className="border border-gray-300 p-3">All users (respects email_new_program preference)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>New Content Alert (Article)</strong><br/>
                  <span className="text-gray-600 text-xs">New blog article published</span>
                </td>
                <td className="border border-gray-300 p-3">Admin publishes article</td>
                <td className="border border-gray-300 p-3">All users (respects email_new_article preference)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Contact Response</strong><br/>
                  <span className="text-gray-600 text-xs">Admin response to contact form</span>
                </td>
                <td className="border border-gray-300 p-3">Admin responds to contact message</td>
                <td className="border border-gray-300 p-3">Contact form submitter</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <strong>Corporate Member Welcome</strong><br/>
                  <span className="text-gray-600 text-xs">Welcome to corporate team</span>
                </td>
                <td className="border border-gray-300 p-3">Corporate admin adds team member</td>
                <td className="border border-gray-300 p-3">New corporate members</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">
                  <strong>Unified Announcement</strong><br/>
                  <span className="text-gray-600 text-xs">Admin bulk announcement</span>
                </td>
                <td className="border border-gray-300 p-3">Admin sends mass notification</td>
                <td className="border border-gray-300 p-3">Target audience (all/subscribers/premium)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* User Preference Settings */}
        <h3 className="text-xl font-bold mb-4 text-[#29B6D2] border-b-2 border-[#29B6D2] pb-2 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Email Preferences
        </h3>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#1a1a1a] text-white">
                <th className="border border-gray-300 p-3 text-left font-bold">Preference Key</th>
                <th className="border border-gray-300 p-3 text-left font-bold">Controls</th>
                <th className="border border-gray-300 p-3 text-left font-bold">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-mono text-xs">email_wod</td>
                <td className="border border-gray-300 p-3">Workout of the Day emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-mono text-xs">email_ritual</td>
                <td className="border border-gray-300 p-3">Daily Ritual emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-mono text-xs">email_monday_motivation</td>
                <td className="border border-gray-300 p-3">Monday Motivation emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-mono text-xs">email_new_workout</td>
                <td className="border border-gray-300 p-3">New workout notification emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-mono text-xs">email_new_program</td>
                <td className="border border-gray-300 p-3">New program notification emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-mono text-xs">email_new_article</td>
                <td className="border border-gray-300 p-3">New article notification emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-mono text-xs">email_weekly_activity</td>
                <td className="border border-gray-300 p-3">Weekly Activity Report emails</td>
                <td className="border border-gray-300 p-3">true</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-mono text-xs">checkin_reminders</td>
                <td className="border border-gray-300 p-3">Check-in reminder notifications</td>
                <td className="border border-gray-300 p-3">false</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-[#29B6D2] pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg mb-2">Technical Notes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All notifications use dual-channel delivery (dashboard + email)</li>
                <li>• Email sender: notifications@smartygym.com</li>
                <li>• Reply-to: admin@smartygym.com</li>
                <li>• Rate limiting: 600ms between email sends</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Document Version: 1.0</p>
              <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-gray-500">
            © {new Date().getFullYear()} SmartyGym. All rights reserved. | System Documentation
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronJobsDocumentation;
