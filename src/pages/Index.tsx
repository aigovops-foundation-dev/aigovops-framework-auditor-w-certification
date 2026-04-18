const Index = () => {
  // Redirect to landing page
  if (typeof window !== "undefined") {
    window.location.replace("/");
  }
  return null;
};

export default Index;
