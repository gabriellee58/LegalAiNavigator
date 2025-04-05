import { Link, useLocation } from "wouter";
import { t } from "@/lib/i18n";

function MobileNavbar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center h-14 z-10">
      <Link href="/legal-assistant">
        <a className={`flex flex-col items-center justify-center ${isActive('/legal-assistant') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">smart_toy</span>
          <span className="text-xs mt-1">{t("legal_assistant")}</span>
        </a>
      </Link>
      <Link href="/document-generator">
        <a className={`flex flex-col items-center justify-center ${isActive('/document-generator') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">description</span>
          <span className="text-xs mt-1">{t("document_generator")}</span>
        </a>
      </Link>
      <Link href="/legal-research">
        <a className={`flex flex-col items-center justify-center ${isActive('/legal-research') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">search</span>
          <span className="text-xs mt-1">{t("legal_research")}</span>
        </a>
      </Link>
      <Link href="/more">
        <a className={`flex flex-col items-center justify-center ${isActive('/more') ? 'text-primary' : 'text-neutral-500'}`}>
          <span className="material-icons text-md">menu</span>
          <span className="text-xs mt-1">More</span>
        </a>
      </Link>
    </div>
  );
}

export default MobileNavbar;
