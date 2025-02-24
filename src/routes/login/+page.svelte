<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<div class="login-container">
    <div class="login-card">
        <h1>Welcome to Windy</h1>
        <p>Please log in to continue</p>
        <form 
            method="GET" 
            action="/auth/login"
        >
            <button type="submit" class="btn btn-primary">
                Login
            </button>
        </form>
    </div>
</div>