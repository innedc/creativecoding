export default function timer() {
  setTimeout(
    () => {
      location.href = 'index.html';
    },
    6 * 60 * 1000,
  );
}
