// public/script/donationHistory.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
  
    const container = document.getElementById('donationHistoryContainer');
  
    try {
      const response = await fetch('/api/donations/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch donation history');
      }
  
      const donations = await response.json();
      if (donations.length === 0) {
        container.innerHTML = `<div class="col-12 text-muted">You have not made any donations yet.</div>`;
        return;
      }
  
      donations.forEach(donation => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
  
        card.innerHTML = `
          <div class="card shadow">
            <div class="card-body">
              <h5 class="card-title text-success"><i class="bi bi-bank"></i> ${donation.Charity.name}</h5>
              <p><strong>Amount:</strong> $${donation.amount.toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</p>
              <p><strong>Charity Email:</strong> ${donation.Charity.email}</p>
              <p><strong>Payment ID:</strong> ${donation.stripePaymentId || 'N/A'}</p>
              <button class="btn btn-outline-primary btn-sm mt-2 download-receipt-btn" data-id="${donation.id}">
                <i class="bi bi-download"></i> Download Receipt
              </button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
  
      // 🔗 Add download click handler for secure download
      container.addEventListener('click', async (e) => {
        const btn = e.target.closest('.download-receipt-btn');
        if (!btn) return;
  
        const donationId = btn.getAttribute('data-id');
        try {
          const res = await fetch(`/api/donations/${donationId}/receipt`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          if (!res.ok) throw new Error('Download failed');
  
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `donation_receipt_${donationId}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Download error:', err);
          alert('Could not download receipt.');
        }
      });
  
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="col-12 text-danger">Error loading donation history.</div>`;
    }




    document.getElementById('downloadAllReceipts').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch('/api/donations/receipt/all', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
      
          if (!res.ok) throw new Error('Download failed');
      
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `donation_history.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Failed to download all receipts:', err);
          alert('Unable to download all receipts.');
        }
      });
  });
  
  
  