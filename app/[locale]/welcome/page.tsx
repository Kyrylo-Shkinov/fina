import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, BarChart3, Users } from 'lucide-react';

export const dynamic = 'force-static';

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const features = [
    {
      icon: Wallet,
      title: t('landing.features.budget.title'),
      description: t('landing.features.budget.description'),
    },
    {
      icon: TrendingUp,
      title: t('landing.features.transactions.title'),
      description: t('landing.features.transactions.description'),
    },
    {
      icon: BarChart3,
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.description'),
    },
    {
      icon: Users,
      title: t('landing.features.groups.title'),
      description: t('landing.features.groups.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">{t('common.appName')}</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/login`}>{t('common.login')}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/register`}>{t('common.register')}</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            {t('landing.title')}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('landing.subtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={`/${locale}/register`}>{t('common.getStarted')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${locale}/login`}>{t('common.login')}</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t mt-16">
        <p className="text-center text-gray-500 text-sm">
          © 2024 {t('common.appName')}. Всі права захищені.
        </p>
      </footer>
    </div>
  );
}

