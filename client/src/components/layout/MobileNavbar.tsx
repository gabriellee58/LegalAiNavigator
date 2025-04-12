import { Link, useLocation } from "wouter";
import { t } from "@/lib/i18n";

function MobileNavbar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-around items-center h-14 z-10">
      <Link href="/legal-assistant">
        <div className={`flex flex-col items-center justify-center ${isActive('/legal-assistant') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">Smart_Toy</span>
          <span className="text-xs mt-1">{t("legal_assistant")}</span>
        </div>
      </Link>
      <Link href="/document-generator">
        <div className={`flex flex-col items-center justify-center ${isActive('/document-generator') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">Description</span>
          <span className="text-xs mt-1">{t("document_generator")}</span>
        </div>
      </Link>
      <Link href="/document-navigator">
        <div className={`flex flex-col items-center justify-center ${isActive('/document-navigator') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">Find_In_Page</span>
          <span className="text-xs mt-1">{t("document_navigator")}</span>
        </div>
      </Link>
      <Link href="/legal-research">
        <div className={`flex flex-col items-center justify-center ${isActive('/legal-research') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">Search</span>
          <span className="text-xs mt-1">{t("legal_research")}</span>
        </div>
      </Link>
      <Link href="/more">
        <div className={`flex flex-col items-center justify-center ${isActive('/more') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">Menu</span>
          <span className="text-xs mt-1">{t("more")}</span>
        </div>
      </Link>
    </div>
  );
}

export default MobileNavbar;
