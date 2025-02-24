<script lang="ts">
    import { page } from '$app/stores';
    
    // Check if there's an email in the URL params
    $: email = $page.url.searchParams.get('email') || '';
  </script>
  
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h2 class="text-3xl font-extrabold text-gray-900">
          Check Your Email
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          We sent a verification email to:
        </p>
        <p class="mt-2 text-lg font-medium text-indigo-600">
          {email}
        </p>
        <div class="mt-8 space-y-4">
          <p class="text-gray-600">
            Please check your inbox and click the verification link to continue.
          </p>
          <p class="text-sm text-gray-500">
            After verifying your email, return here and click the button below to continue.
          </p>
          <a 
            href="/login"
            class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Login
          </a>
        </div>
      </div>
    </div>
  </div>