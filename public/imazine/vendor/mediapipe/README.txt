MediaPipe Tasks Vision 0.10.14 (Apache-2.0, https://github.com/google-ai-edge/mediapipe) dan model Selfie Segmenter (float16).
Disalin dari paket npm @mediapipe/tasks-vision@0.10.14 dan storage.googleapis.com/mediapipe-models supaya halaman /imazine
tidak bergantung pada cdn.jsdelivr.net dan storage.googleapis.com (ada jaringan Wi-Fi yang memblokir atau melambatkan keduanya).
Dipakai oleh magcover.js (magSegmenter); CDN tetap dipakai sebagai cadangan bila file di sini gagal dimuat.
