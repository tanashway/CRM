"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface FixDatabaseResponse {
  success: boolean;
  message: string;
  details?: {
    usersCreated?: boolean;
    contactsCreated?: boolean;
  };
}

export default function FixDatabasePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<FixDatabaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fixDatabase = async () => {
    try {
      setStatus("loading");
      const response = await fetch("/api/fix-db");
      
      if (!response.ok) {
        throw new Error(`Failed to fix database: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      console.error("Error fixing database:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setStatus("error");
    }
  };

  useEffect(() => {
    fixDatabase();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Setting up your database tables</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Setting up your database tables...
              </p>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
              <p className="text-center text-muted-foreground mb-4">
                Your database tables have been created successfully.
              </p>
              <div className="w-full bg-muted p-4 rounded-md text-sm">
                <p className="font-medium">Details:</p>
                <p>Users table: {result?.details?.usersCreated ? "Created" : "Already exists"}</p>
                <p>Contacts table: {result?.details?.contactsCreated ? "Created" : "Already exists"}</p>
              </div>
            </>
          )}
          
          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Setup Failed</h3>
              <p className="text-center text-muted-foreground mb-4">
                There was an error setting up your database.
              </p>
              <div className="w-full bg-destructive/10 p-4 rounded-md text-sm text-destructive">
                <p className="font-medium">Error:</p>
                <p>{error || "Unknown error"}</p>
                <p className="mt-2">
                  Don&apos;t worry, you can try again or contact support if the issue persists.
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push("/contacts")}
            disabled={status === "loading"}
          >
            Go to Contacts
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 