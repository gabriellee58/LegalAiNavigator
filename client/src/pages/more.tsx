import { Link } from "wouter";
import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";

export default function MorePage() {
  return (
    <MainLayout>
      <div className="container py-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">{t("more_options")}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dispute-resolution">
            <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-3">gavel</span>
                <h2 className="text-xl font-semibold">{t("dispute_resolution")}</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                {t("dispute_resolution_description")}
              </p>
            </div>
          </Link>
          
          <Link href="/compliance-checker">
            <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-3">verified</span>
                <h2 className="text-xl font-semibold">{t("compliance_checker")}</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                {t("compliance_checker_description")}
              </p>
            </div>
          </Link>
          
          <Link href="/legal-domains">
            <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-3">category</span>
                <h2 className="text-xl font-semibold">Legal Domains</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                Explore comprehensive information about different legal practice areas
              </p>
            </div>
          </Link>
          
          <Link href="/guides/getting-started">
            <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-3">menu_book</span>
                <h2 className="text-xl font-semibold">{t("guides")}</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                {t("guides_description")}
              </p>
            </div>
          </Link>
          
          <Link href="/settings">
            <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-3">settings</span>
                <h2 className="text-xl font-semibold">{t("settings")}</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                {t("settings_description")}
              </p>
            </div>
          </Link>
          
          <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
            <div className="flex items-center mb-2">
              <span className="material-icons text-primary mr-3">expand_more</span>
              <h2 className="text-xl font-semibold">{t("coming_soon")}</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              {t("more_features_coming_soon")}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}