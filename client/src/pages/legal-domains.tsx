import { useTitle } from '@/hooks/use-title';
import { useTranslation } from '@/hooks/use-translation';
import PageHeader from '@/components/layout/PageHeader';
import { DomainCategories } from '@/components/legal/DomainCategories';
import { Container } from '@/components/ui';
import { BookOpen } from 'lucide-react';

/**
 * Legal Domains overview page with categorized navigation
 */
export default function LegalDomainsPage() {
  const { t } = useTranslation();
  useTitle(t('legal_domains'));

  return (
    <Container>
      <PageHeader
        title={t('legal_domains')}
        description={t('legal_domains_description')}
        icon={<BookOpen className="h-6 w-6" />}
      />

      <div className="mb-8">
        <p className="text-lg text-muted-foreground">
          Browse through our comprehensive collection of legal domains applicable to Canadian law.
          Each category contains specialized legal information, document templates, and resources.
        </p>
      </div>

      <DomainCategories />
    </Container>
  );
}