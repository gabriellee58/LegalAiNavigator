const fs = require('fs');

const filePath = 'client/src/hooks/use-subscription.tsx';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Replace all redirects with our helper function
const updatedContent = fileContent
  .replace(
    `      // If the response contains a URL (for Stripe checkout), redirect to it
      if (data && data.url) {
        window.location.href = data.url;
        return;
      }`,
    `      // If the response contains a URL (for Stripe checkout), redirect to it
      if (data && data.url) {
        redirectToStripeCheckout(data.url);
        return;
      }`
  )
  .replace(
    `      // If the response contains a URL (for Stripe checkout), redirect to it
      if (data && data.url) {
        window.location.href = data.url;
        return;
      }`,
    `      // If the response contains a URL (for Stripe checkout), redirect to it
      if (data && data.url) {
        redirectToStripeCheckout(data.url);
        return;
      }`
  )
  .replace(
    `      // Redirect to billing portal URL
      window.location.href = data.url;`,
    `      // Redirect to billing portal URL
      redirectToStripeCheckout(data.url);`
  );

fs.writeFileSync(filePath, updatedContent);
console.log('Updated all redirects in subscription.tsx');
