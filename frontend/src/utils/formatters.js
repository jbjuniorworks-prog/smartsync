export const formatarMoeda = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const formatarData = (data) => {
  if (!data) return '—';
  const d = new Date(data);
  if (isNaN(d)) return data;
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const comprimirImagem = (file, maxWidth = 400) =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = URL.createObjectURL(file);
  });