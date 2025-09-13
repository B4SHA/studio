
import { useLanguage } from '@/context/language-context';
import { locales } from '@/lib/locales';

export function useTranslation() {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = locales[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = locales.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result;
  };

  const navigationLinks = [
    { name: t('navigation.newsSleuth'), href: '/news-sleuth' },
    { name: t('navigation.videoIntegrity'), href: '/video-integrity' },
    { name: t('navigation.audioAuthenticator'), href: '/audio-authenticator' },
    { name: t('navigation.imageVerifier'), href: '/image-verifier' },
  ];

  return { t, navigationLinks };
}
