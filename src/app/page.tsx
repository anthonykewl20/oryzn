import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Oryzn</CardTitle>
          <CardDescription>Trustworthy audit history for GitHub Projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed evidence, stored once and explained clearly.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="/api/health">Check application health</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
