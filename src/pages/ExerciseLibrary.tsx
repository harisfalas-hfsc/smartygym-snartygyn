import { Helmet } from 'react-helmet';

const ExerciseLibrary = () => {
  return (
    <>
      <Helmet>
        <title>Exercise Library - Smarty Gym | YouTube Channel by Haris Falas</title>
        <meta name="description" content="Watch exercise videos on The Smarty Gym YouTube channel by Haris Falas. Comprehensive exercise demonstrations and tutorials." />
        <meta name="keywords" content="smartygym exercises, smarty gym, smartygym.com, Haris Falas, exercise library, workout videos, exercise tutorials, gym training videos" />
        
        <meta property="og:title" content="Exercise Library - Smarty Gym | YouTube Channel" />
        <meta property="og:description" content="Watch exercise demonstrations on The Smarty Gym YouTube channel by Haris Falas" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/exerciselibrary" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Exercise Library - Smarty Gym" />
        <meta name="twitter:description" content="Exercise videos at smartygym.com YouTube channel" />
        
        <link rel="canonical" href="https://smartygym.com/exerciselibrary" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Exercise Library</h1>
          
          <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
            <iframe
              src="https://www.youtube.com/@TheSmartyGym"
              title="The Smarty Gym YouTube Channel"
              className="w-full h-full rounded-lg border-2 border-border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExerciseLibrary;
