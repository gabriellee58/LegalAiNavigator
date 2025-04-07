import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import {
  Gavel,
  Home,
  UserCheck,
  Briefcase,
  Building,
  Landmark,
  Scale,
  ShieldAlert,
  Building2,
  Heart,
  Brain,
  FileCog,
  Leaf,
  Globe,
  FileCheck,
  ScrollText,
  BookOpen,
  Map,
  VideoIcon,
  SquareTerminal,
  Users,
  MapPin,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface CategoryItem {
  id: string;
  icon: React.ReactNode;
  subcategories: string[];
}

/**
 * Legal domain categories with their subcategories for navigation
 */
export function DomainCategories() {
  const { t } = useTranslation();

  // Categories and their subcategories
  const categories: Record<string, CategoryItem> = {
    personal: {
      id: 'personal',
      icon: <UserCheck className="h-7 w-7" />,
      subcategories: [
        'family_law',
        'estate_planning',
        'personal_injury',
        'consumer_rights',
        'human_rights',
      ],
    },
    business: {
      id: 'business',
      icon: <Briefcase className="h-7 w-7" />,
      subcategories: [
        'business_law',
        'employment_law',
        'intellectual_property',
        'tax_law',
        'insurance',
      ],
    },
    property: {
      id: 'property',
      icon: <Home className="h-7 w-7" />,
      subcategories: [
        'real_estate_law',
        'land_claims',
        'environmental',
      ],
    },
    government: {
      id: 'government',
      icon: <Landmark className="h-7 w-7" />,
      subcategories: [
        'administrative',
        'immigration_law',
        'constitutional',
        'indigenous_law',
      ],
    },
    legal: {
      id: 'legal',
      icon: <Scale className="h-7 w-7" />,
      subcategories: [
        'civil_litigation',
        'criminal',
        'youth_justice',
        'mediation',
      ],
    },
    specialized: {
      id: 'specialized',
      icon: <BookOpen className="h-7 w-7" />,
      subcategories: [
        'technology',
        'entertainment',
      ],
    },
  };

  /**
   * Get the translated category name
   */
  const getCategoryName = (categoryId: string): string => {
    switch (categoryId) {
      case 'personal':
        return t('personal_law');
      case 'business':
        return t('business_and_commercial');
      case 'property':
        return t('property_and_real_estate');
      case 'government':
        return t('government_and_administrative');
      case 'legal':
        return t('litigation_and_dispute');
      case 'specialized':
        return t('specialized_fields');
      default:
        return categoryId;
    }
  };

  /**
   * Get the route for a subcategory
   */
  const getSubcategoryRoute = (subcategory: string): string => {
    return `/legal-domains/${subcategory.replace(/_/g, '-')}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.values(categories).map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 px-5">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 p-2 text-white">
                {category.icon}
              </div>
              <CardTitle>{getCategoryName(category.id)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ul className="grid gap-2">
              {category.subcategories.map((subcategory) => (
                <li key={subcategory}>
                  <Link href={getSubcategoryRoute(subcategory)}>
                    <a className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                      <Gavel className="h-4 w-4" />
                      <span>{t(subcategory)}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}