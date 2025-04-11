import React, { useState } from "react";
import { PasswordResetRequestForm, PasswordResetForm } from "@/components/forms/password-reset-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

function PasswordResetPage() {
  // State to track which form to show
  const [activeTab, setActiveTab] = useState("request");

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Password Recovery</h1>
        <p className="text-center text-muted-foreground">
          Reset your password or return to{" "}
          <Link href="/auth" className="text-primary underline">
            login
          </Link>
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Tabs 
            defaultValue="request" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request">Request Reset</TabsTrigger>
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
            </TabsList>
            <TabsContent value="request" className="mt-4">
              <PasswordResetRequestForm />
            </TabsContent>
            <TabsContent value="reset" className="mt-4">
              <PasswordResetForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Simple export without breadcrumbs for now
export default PasswordResetPage;