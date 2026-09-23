import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LegalDocument, { type LegalHighlight } from '../components/LegalDocument';

const sections = [
  {
    icon: 'person-circle-outline' as const,
    title: 'Who can use JapLearn',
    body: 'JapLearn is built for classroom language learning and is intended for learners aged 13 and above, or younger learners enrolled by their school with the consent of a parent, guardian or the school. JapLearn is free to use; there are no paid features, subscriptions or in-app purchases.',
  },
  {
    icon: 'key-outline' as const,
    title: 'Your account',
    body: 'Give accurate account details, keep your password private, and use only the account assigned to you. You are responsible for what happens through your account. Student accounts are activated after email confirmation and JapLearn admin approval.',
  },
  {
    icon: 'school-outline' as const,
    title: 'Classes and what teachers see',
    body: 'When you join a class with a class code, that teacher can see your name, email address and learning records for the class, including lesson progress, quiz and game scores, and speaking feedback. Join only classes you actually belong to.',
  },
  {
    icon: 'mic-outline' as const,
    title: 'Speaking activities',
    body: 'Speaking activities record your voice while the activity is running and send it for automated pronunciation assessment and feedback, as described in our Privacy Policy. Use them for language practice only, and do not record other people or share private or sensitive information through them.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Acceptable use',
    body: 'Do not misuse JapLearn, interfere with the service, attempt unauthorized access, submit harmful or offensive content, impersonate another person, cheat in graded activities, or use the platform in a way that harms other learners or teachers.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Automated scores and feedback',
    body: 'Scores, pronunciation assessments and generated feedback are produced automatically and are learning aids. They can be wrong or incomplete, are not a formal language certification, and should not be treated as professional or academic advice. Your teacher decides how they count in class.',
  },
  {
    icon: 'analytics-outline' as const,
    title: 'Progress and availability',
    body: 'JapLearn works to save your progress accurately, including offline work that syncs when you reconnect. Uninterrupted access cannot be guaranteed: maintenance, connectivity, device limits or technical issues may temporarily affect features.',
  },
  {
    icon: 'create-outline' as const,
    title: 'Content ownership',
    body: 'Lessons, activities, characters, artwork and other JapLearn material belong to JapLearn or its licensors, and may not be copied or redistributed without permission. Content you submit stays yours, and you allow JapLearn to process it to run the service and show it to your teacher.',
  },
  {
    icon: 'trash-outline' as const,
    title: 'Ending your account',
    body: 'You may delete your account at any time from Profile, then Delete account, or at portal.japlearn.com/delete-account. Deletion is permanent. We may restrict or remove accounts when needed for security, classroom administration, policy violations, or to protect JapLearn and its users.',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Changes and contact',
    body: 'Lessons, activities, features and these terms may change as JapLearn improves, and the current version is available in the app and at portal.japlearn.com/terms. Continued use after an update means the revised terms apply. Questions: japlearnofficial@gmail.com.',
  },
];

const highlights: LegalHighlight[] = [
  { icon: 'gift-outline', title: 'Free to use', text: 'No subscriptions or in-app purchases.' },
  { icon: 'people-outline', title: 'Ages 13 and up', text: 'Or younger learners enrolled by their school.' },
  { icon: 'sparkles-outline', title: 'Scores are learning aids', text: 'Automatic feedback, not formal certification.' },
  { icon: 'trash-outline', title: 'Leave whenever', text: 'Delete your account at any time.' },
];

export default function TermsOfServicePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { fromLogin } = params;

  const handleClose = () => {
    if (fromLogin === 'true') {
      router.replace('/Login');
      return;
    }
    router.back();
  };

  return (
    <LegalDocument
      kind="terms"
      eyebrow="USING JAPLEARN"
      title="Terms of Use"
      intro="The simple rules that keep JapLearn safe, fair and useful for every learner and teacher."
      effective="Last updated September 20, 2026"
      highlights={highlights}
      sections={sections}
      contactTitle="Questions about these terms?"
      contactSubject="JapLearn Terms Question"
      doneLabel="Done"
      onClose={handleClose}
      onSwitch={() => router.replace({ pathname: '/PrivacyPolicyPage', params })}
    />
  );
}
