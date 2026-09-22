import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LegalDocument, { type LegalHighlight } from '../components/LegalDocument';

const sections = [
  {
    icon: 'person-outline' as const,
    title: 'Information we collect',
    body: 'Account details you give us: your first and last name, email address, password (stored encrypted, never in readable form), your role as a student, and the class code you join. Learning records we create as you use JapLearn: lesson completion, quiz answers, game scores and attempts, badges, streaks, daily goal minutes, and speaking practice results. Basic technical information needed to run and troubleshoot the service, such as your app version and the date and time of activity.',
  },
  {
    icon: 'mic-outline' as const,
    title: 'Microphone and voice recordings',
    body: 'Speaking activities (Talk with Sumi, Guided Phrase Practice, Dialogue Relay and similar exercises) record your voice only while you are in that activity and only after you allow microphone access on your device. Your recorded speech is sent securely to Microsoft Azure Speech Services to measure pronunciation, accuracy, fluency and completeness. What you said, as text, is also sent to Google Gemini to generate learning feedback. JapLearn stores the resulting transcript, scores and feedback with your account. We do not store the raw audio recording after it has been assessed, and we never use your voice for advertising or to identify you.',
  },
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Device permissions we request',
    body: 'Microphone: required for speaking activities; you can decline and still use every other part of JapLearn. Internet access: required to sign in, save progress and load lessons. Vibration: short feedback during some games. Photos and files: only used if you attach an image or document to lesson content. JapLearn does not request your location, contacts, camera roll scanning, phone number, calendar or SMS.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'How we use information',
    body: 'To create and manage your account, save and sync your learning progress, unlock lessons, award badges, show your scores, run classroom activities your teacher assigns, give speaking feedback, answer your support requests, and keep JapLearn secure and reliable. We do not use your information for advertising, and we do not sell it.',
  },
  {
    icon: 'school-outline' as const,
    title: 'What your teacher can see',
    body: 'When you join a class with a class code, the teacher who owns that class can see your name, email address, lesson progress, quiz and game scores, and speaking practice results for that class. Teachers cannot see your password. Other students cannot see your records.',
  },
  {
    icon: 'people-outline' as const,
    title: 'Companies that process data for us',
    body: 'MongoDB Atlas stores your account and learning records. Render hosts the JapLearn server. Microsoft Azure Speech Services assesses your pronunciation. Google Gemini generates conversation and learning feedback. Brevo sends account emails such as confirmation, password reset and account deletion. Expo delivers app updates. These providers process data only to deliver JapLearn to you. We do not sell personal information or share it for advertising.',
  },
  {
    icon: 'lock-closed-outline' as const,
    title: 'Data protection',
    body: 'Your connection to JapLearn uses encrypted HTTPS. Passwords are hashed with bcrypt and cannot be read by us. Sign-in sessions expire, and teacher access is limited to that teacher\'s own classes. No online service can promise perfect security, so keep your password private and tell us if you notice anything suspicious.',
  },
  {
    icon: 'server-outline' as const,
    title: 'Storage and retention',
    body: 'Your data is stored on servers operated by our providers and may be processed outside the Philippines. We keep account and learning information while your account is active. If you delete your account, your records are removed immediately, although routine encrypted backups may retain copies for a short period before they expire.',
  },
  {
    icon: 'trash-outline' as const,
    title: 'Deleting your account',
    body: 'You can delete your JapLearn account at any time from Profile, then Delete account. You can also delete it from a web browser at portal.japlearn.com/delete-account without installing the app. Deletion permanently removes your account, lesson progress, badges, quiz and game scores, and speaking feedback. It cannot be undone. If you can no longer access your email address, contact japlearnofficial@gmail.com and we will verify and delete the account for you.',
  },
  {
    icon: 'options-outline' as const,
    title: 'Your choices and rights',
    body: 'You can view your profile details, join or change your class, reset your password, decline microphone access, and request a copy or correction of your information by contacting us. Some details, such as your email address, are required for the account to work.',
  },
  {
    icon: 'happy-outline' as const,
    title: 'Children and school use',
    body: 'JapLearn is made for classroom use and is intended for learners aged 13 and above, or younger learners enrolled by their school with the consent of a parent, guardian or the school. If you believe a child has created an account without the proper consent, contact japlearnofficial@gmail.com and we will delete it.',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Policy updates and contact',
    body: 'We update this policy when JapLearn features or privacy practices change, and the current version is always available in the app and at portal.japlearn.com/privacy with its effective date. For any privacy question or request, email japlearnofficial@gmail.com.',
  },
];

const highlights: LegalHighlight[] = [
  { icon: 'ribbon-outline', title: 'Never sold', text: 'We do not sell your data or use it for advertising.' },
  { icon: 'mic-outline', title: 'Microphone on request', text: 'Only in speaking activities, after you allow it.' },
  { icon: 'school-outline', title: 'Teacher sees their class', text: 'Only the teacher of the class you join.' },
  { icon: 'trash-outline', title: 'Delete any time', text: 'In the app or on the web, immediately.' },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fromSignup, fromProfile, fromLogin } = params;

  const handleClose = () => {
    if (fromSignup === 'true') {
      router.push({ pathname: '/Signup', params: { showPrivacyModal: 'true' } });
    } else if (fromLogin === 'true') {
      router.replace('/Login');
    } else if (fromProfile === 'true') {
      router.replace('/Profile');
    } else {
      router.replace('/Profile');
    }
  };

  return (
    <LegalDocument
      kind="privacy"
      eyebrow="PRIVACY & TRUST"
      title="Privacy Policy"
      intro="Exactly what JapLearn collects, why, who processes it, and how to delete it."
      effective="Last updated September 20, 2026"
      highlights={highlights}
      sections={sections}
      contactTitle="Privacy questions?"
      contactSubject="JapLearn Privacy Question"
      doneLabel={fromSignup === 'true' ? 'I understand' : 'Done'}
      onClose={handleClose}
      onSwitch={() => router.replace({ pathname: '/TermsOfServicePage', params })}
    />
  );
}
