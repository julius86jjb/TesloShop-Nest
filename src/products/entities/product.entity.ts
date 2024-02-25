import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entty";
import { User } from '../../auth/entities/user.entity';


@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;


    @Column('float', {
        default: 0
    })
    price: number;

    @Column({    // otra forma de hacerlo
        type: 'text',
        nullable: true
    })
    description: string;


    @Column('text', {
        unique: true
    })
    slug: string;


    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];


    @Column('text')
    gender: string;

    @Column({
        type: 'text',
        array: true,
        default: []
    })
    tags: string[]

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true } 
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true} // eager: para que cualquier consulta nos devuelve tambien el user(que cargue la relacion)
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title

        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')

    }


    @BeforeUpdate()
    checkSlugUpdate() {
        // siempre tenermos slug antes de update 
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')

    }

}
