package br.com.henrique.bloodcrown_cs.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.henrique.bloodcrown_cs.Models.ItemModel;

@Repository
public interface ItemRepository extends JpaRepository<ItemModel, String> {}
