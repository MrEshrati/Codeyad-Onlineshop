const deleteProduct = (e) => {
    const prodId = e.parentNode.querySelector('[name=productId]').value;
    const Token = e.parentNode.querySelector('[name=_csrf]').value;

    const productElement = e.closest("article");

    fetch(`/admin/product/${prodId}`,{
        method:'DELETE',
        headers: {
            'csrf-token': Token,
        }
    }).then(result => {
        return result.json();
    }).then(data => {
        productElement.parentNode.removeChild(productElement);
    }).catch(err => {
        console.log(err);
    });
}