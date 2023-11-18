$('.scrollTrigger').on('inview', function(event, isInView) {
    if (isInView) {//表示領域に入った時1度だけアニメーションをさせる
      $(this).addClass('animate__animated animate__fadeInUp');//クラス名が付与
    }
  });