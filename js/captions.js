/* ============================================
   ROMANTIC CAPTIONS
   Inspired by Jaden Smith's romantic music style
   ============================================ */

const ROMANTIC_CAPTIONS = [
  // Dreamy / celestial love themes
  "You're the sunlight breaking through my universe",
  "Every moment with you feels like a beautiful escape",
  "I found my paradise the day I found you",
  "You're the melody I never wanna stop playing",
  "Falling for you was the best trip I ever took",
  "You make the whole world feel brand new",
  "We're two souls dancing through the cosmos",
  "Your love is the wave I wanna ride forever",
  "I'd cross every ocean just to see you smile",
  "You're the only frequency my heart tunes into",
  "Somewhere between the stars, I found your light",
  "We don't need wings, your love makes me fly",
  "You turned my grey skies into golden hours",
  "Every sunrise reminds me why I wake up for you",
  "Our love story is written in constellations",
  "You're the dream I never want to wake up from",
  "In a world full of noise, you're my favorite sound",
  "Your love hits different, like the first rain in summer",
  "I looked at the moon and saw your reflection",
  "We're infinite, you and me, no ending in sight",
  "You make even the ordinary feel like magic",
  "Your smile is the compass that guides me home",
  "I don't need the universe when I've got your world",
  "We're painting love across the sky tonight",
  "Every heartbeat spells out your name",
  "You're the chapter I want to read over and over",
  "Lost in your eyes, and I don't want to be found",
  "Your love is the gravity keeping me grounded",
  "We vibe on a level the world can't touch",
  "You're the poetry I didn't know my heart could write",
  "Dancing through life with you is my favorite adventure",
  "You're the sunset I chase and the sunrise I cherish",
  "Our love is the kind of beautiful they write songs about",
  "You're every beautiful lyric in my favorite song",
  "In this crazy world, you're my peace",
  "Loving you feels like coming home to a place I've never been",
  "You and me, we're a whole different dimension",
  "Your love is the fire that lights up my darkest nights",
  "I was lost in space until you became my star",
  "Together we're a masterpiece the world's never seen"
];

// Get a random caption
function getRandomCaption() {
  return ROMANTIC_CAPTIONS[Math.floor(Math.random() * ROMANTIC_CAPTIONS.length)];
}

// Get caption by index (cycling)
function getCaptionByIndex(index) {
  return ROMANTIC_CAPTIONS[index % ROMANTIC_CAPTIONS.length];
}

// Get multiple unique random captions
function getRandomCaptions(count) {
  const shuffled = [...ROMANTIC_CAPTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
