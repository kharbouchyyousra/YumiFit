export function ordersToCsv(orders) {
  const headers = [
    'Numero', 'Date', 'Nom', 'Prenom', 'Email', 'Telephone',
    'Adresse', 'Ville', 'Produits', 'Total', 'Statut'
  ];

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows = orders.map(o => {
    const produits = o.items.map(i => `${i.name} x${i.qty}`).join(' | ');
    return [
      o.number,
      new Date(o.createdAt).toLocaleString('fr-FR'),
      o.customer.nom,
      o.customer.prenom,
      o.customer.email,
      o.customer.telephone,
      o.customer.adresse,
      o.customer.ville,
      produits,
      o.total + ' DH',
      o.status
    ].map(escape).join(',');
  });

  // BOM pour Excel
  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}