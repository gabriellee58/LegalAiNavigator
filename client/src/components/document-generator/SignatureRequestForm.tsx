
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signatureFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().optional()
});

type SignatureFormData = z.infer<typeof signatureFormSchema>;

interface SignatureRequestFormProps {
  onSubmit: (data: SignatureFormData[]) => void;
  maxSigners?: number;
}

export default function SignatureRequestForm({ onSubmit, maxSigners = 5 }: SignatureRequestFormProps) {
  const [signers, setSigners] = useState<SignatureFormData[]>([]);
  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureFormSchema)
  });

  const addSigner = (data: SignatureFormData) => {
    setSigners([...signers, data]);
    form.reset();
  };

  const submitSigners = () => {
    onSubmit(signers);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {signers.map((signer, index) => (
          <div key={index} className="flex items-center space-x-2 bg-muted p-2 rounded">
            <span>{signer.name}</span>
            <span className="text-muted-foreground">({signer.email})</span>
            {signer.role && <span className="text-muted-foreground">- {signer.role}</span>}
          </div>
        ))}
      </div>

      {signers.length < maxSigners && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addSigner)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter signer's name" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter signer's email" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="E.g., Client, Witness" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit">Add Signer</Button>
          </form>
        </Form>
      )}

      {signers.length > 0 && (
        <Button onClick={submitSigners} className="w-full">
          Send for Signatures
        </Button>
      )}
    </div>
  );
}
