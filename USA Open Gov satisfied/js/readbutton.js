//changes text from Read More to Read Less. 
$('.btn-default').click(function () {
  const $this = $(this);
  $this.toggleClass('btn-default');
  if ($this.hasClass('btn-default')) {
    $this.text('Read More');
  } else {
    $this.text('Read Less');
  }
});
