const { error } = await supabaseBrowser().auth.resetPasswordForEmail(
  resetEmail,
  {
    redirectTo: `${window.location.origin}/update-password`,
  }
);
