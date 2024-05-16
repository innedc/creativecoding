export default function timer() {
  setTimeout(
    () => {
      location.href = 'index.html';
    },
    2 * 60 * 1000,
  );
}
